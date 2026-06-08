use serde::{Deserialize, Serialize};
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::command;

#[derive(Serialize)]
pub struct InputState {
    cursor_x: f64,
    cursor_y: f64,
    last_keystroke_ms: u64,
    keystroke_count: u64,
    last_scroll_ms: u64,
    scroll_count: u64,
    last_mouse_move_ms: u64,
    now_ms: u64,
    accessibility_granted: bool,
}

#[command]
pub fn get_input_state() -> InputState {
    let (cx, cy) = crate::input::mouse::get_cursor_position();
    let (last_key, key_count) = crate::input::keyboard::get_typing_stats();
    let (last_scroll, scroll_count) = crate::input::keyboard::get_scroll_stats();
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    InputState {
        cursor_x: cx,
        cursor_y: cy,
        last_keystroke_ms: last_key,
        keystroke_count: key_count,
        last_scroll_ms: last_scroll,
        scroll_count,
        last_mouse_move_ms: crate::input::mouse::get_last_mouse_move_ms(),
        now_ms: now,
        accessibility_granted: crate::input::keyboard::is_monitor_running(),
    }
}

#[command]
pub fn update_character_bounds(x: f64, y: f64, w: f64, h: f64) {
    crate::input::mouse::update_bounds(x, y, w, h);
}

#[command]
pub fn set_click_through(ignore: bool, window: tauri::WebviewWindow) {
    let _ = window.set_ignore_cursor_events(ignore);
}

#[command]
pub fn request_accessibility() -> bool {
    let _ = std::process::Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
        .spawn();
    crate::input::keyboard::is_accessibility_trusted()
}

#[command]
pub fn retry_event_monitor() -> bool {
    crate::input::keyboard::try_start_monitor()
}

#[command]
pub fn read_ai_status() -> Option<String> {
    let home = dirs::home_dir()?;
    let status_path = home.join(".desktop-clippy").join("ai-status.json");
    fs::read_to_string(status_path).ok()
}

#[command]
pub fn load_config() -> Option<String> {
    let home = dirs::home_dir()?;
    let config_path = home.join(".desktop-clippy").join("config.json");
    fs::read_to_string(config_path).ok()
}

#[command]
pub fn save_config(config: String) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("No home directory")?;
    let dir = home.join(".desktop-clippy");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let config_path = dir.join("config.json");
    fs::write(config_path, config).map_err(|e| e.to_string())
}

#[derive(Deserialize)]
pub struct Region {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

#[command]
pub fn update_interactive_regions(regions: Vec<Region>) {
    let tuples: Vec<(f64, f64, f64, f64)> = regions.iter().map(|r| (r.x, r.y, r.w, r.h)).collect();
    crate::input::mouse::update_regions(tuples);
}

#[command]
pub fn set_force_interactive(force: bool) {
    crate::input::mouse::set_force_interactive(force);
}

#[command]
pub fn get_ai_tool_status() -> serde_json::Value {
    if let Some(home) = dirs::home_dir() {
        let status_path = home.join(".desktop-clippy").join("ai-status.json");
        if let Ok(content) = fs::read_to_string(status_path) {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(&content) {
                return value;
            }
        }
    }
    serde_json::json!({ "tool": "none", "status": "idle", "timestamp": 0 })
}
