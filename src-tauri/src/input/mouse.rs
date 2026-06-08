use core_graphics::event::CGEvent;
use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use tauri::Manager;

static CHARACTER_BOUNDS: Mutex<(f64, f64, f64, f64)> = Mutex::new((800.0, 600.0, 144.0, 144.0));
static CURSOR_POS: Mutex<(f64, f64)> = Mutex::new((0.0, 0.0));

pub fn get_cursor_position() -> (f64, f64) {
    if let Ok(source) = CGEventSource::new(CGEventSourceStateID::HIDSystemState) {
        if let Ok(event) = CGEvent::new(source) {
            let point = event.location();
            let pos = (point.x, point.y);
            if let Ok(mut cursor) = CURSOR_POS.lock() {
                *cursor = pos;
            }
            return pos;
        }
    }
    CURSOR_POS.lock().map(|c| *c).unwrap_or((0.0, 0.0))
}

pub fn update_bounds(x: f64, y: f64, w: f64, h: f64) {
    if let Ok(mut bounds) = CHARACTER_BOUNDS.lock() {
        *bounds = (x, y, w, h);
    }
}

pub fn start_hit_test_polling(app_handle: tauri::AppHandle) {
    thread::spawn(move || {
        let mut was_over = false;
        loop {
            let (cx, cy) = get_cursor_position();
            let is_over = if let Ok(bounds) = CHARACTER_BOUNDS.lock() {
                let (bx, by, bw, bh) = *bounds;
                cx >= bx && cx <= bx + bw && cy >= by && cy <= by + bh
            } else {
                false
            };

            if is_over != was_over {
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.set_ignore_cursor_events(!is_over);
                }
                was_over = is_over;
            }

            thread::sleep(Duration::from_millis(33));
        }
    });
}
