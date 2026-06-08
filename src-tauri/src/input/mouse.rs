use core_graphics::event::CGEvent;
use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use tauri::Manager;

static INTERACTIVE_REGIONS: Mutex<Vec<(f64, f64, f64, f64)>> = Mutex::new(Vec::new());
static CURSOR_POS: Mutex<(f64, f64)> = Mutex::new((0.0, 0.0));
static LAST_MOUSE_MOVE_MS: AtomicU64 = AtomicU64::new(0);
static FORCE_INTERACTIVE: AtomicBool = AtomicBool::new(false);

fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

pub fn get_cursor_position() -> (f64, f64) {
    if let Ok(source) = CGEventSource::new(CGEventSourceStateID::HIDSystemState) {
        if let Ok(event) = CGEvent::new(source) {
            let point = event.location();
            let pos = (point.x, point.y);
            if let Ok(mut cursor) = CURSOR_POS.lock() {
                let old = *cursor;
                if (pos.0 - old.0).abs() > 1.0 || (pos.1 - old.1).abs() > 1.0 {
                    LAST_MOUSE_MOVE_MS.store(now_ms(), Ordering::Relaxed);
                }
                *cursor = pos;
            }
            return pos;
        }
    }
    CURSOR_POS.lock().map(|c| *c).unwrap_or((0.0, 0.0))
}

pub fn get_last_mouse_move_ms() -> u64 {
    LAST_MOUSE_MOVE_MS.load(Ordering::Relaxed)
}

pub fn update_bounds(x: f64, y: f64, w: f64, h: f64) {
    if let Ok(mut regions) = INTERACTIVE_REGIONS.lock() {
        if regions.is_empty() {
            regions.push((x, y, w, h));
        } else {
            regions[0] = (x, y, w, h);
        }
    }
}

pub fn update_regions(new_regions: Vec<(f64, f64, f64, f64)>) {
    if let Ok(mut regions) = INTERACTIVE_REGIONS.lock() {
        *regions = new_regions;
    }
}

pub fn set_force_interactive(force: bool) {
    FORCE_INTERACTIVE.store(force, Ordering::Relaxed);
}

pub fn start_hit_test_polling(app_handle: tauri::AppHandle) {
    LAST_MOUSE_MOVE_MS.store(now_ms().saturating_sub(5000), Ordering::Relaxed);
    thread::spawn(move || {
        let mut was_over = false;
        loop {
            let force = FORCE_INTERACTIVE.load(Ordering::Relaxed);
            let is_over = if force {
                true
            } else {
                let (cx, cy) = get_cursor_position();
                if let Ok(regions) = INTERACTIVE_REGIONS.lock() {
                    regions.iter().any(|(bx, by, bw, bh)| {
                        cx >= *bx && cx <= *bx + *bw && cy >= *by && cy <= *by + *bh
                    })
                } else {
                    false
                }
            };

            if is_over != was_over {
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.set_ignore_cursor_events(!is_over);
                }
                was_over = is_over;
            }

            if !force {
                let _ = get_cursor_position();
            }

            thread::sleep(Duration::from_millis(16));
        }
    });
}
