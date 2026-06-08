mod commands;
mod input;

use tauri::Manager;

#[cfg(target_os = "macos")]
use cocoa::appkit::{NSApplication, NSApplicationActivationPolicy, NSWindow};
#[cfg(target_os = "macos")]
use cocoa::base::nil;
#[cfg(target_os = "macos")]
#[allow(unused_imports)]
use objc::{msg_send, sel, sel_impl};

#[cfg(target_os = "macos")]
fn setup_macos_transparency(app: &tauri::App) {
    let window = app.get_webview_window("main").unwrap();
    let ns_window = window.ns_window().unwrap() as cocoa::base::id;

    unsafe {
        // Make the window fully transparent
        NSWindow::setOpaque_(ns_window, cocoa::base::NO);
        let clear_color = cocoa::appkit::NSColor::clearColor(nil);
        NSWindow::setBackgroundColor_(ns_window, clear_color);

        // Set as accessory app (no dock icon)
        let app_handle = NSApplication::sharedApplication(nil);
        app_handle.setActivationPolicy_(NSApplicationActivationPolicy::NSApplicationActivationPolicyAccessory);

        // Allow mouse events to pass through transparent areas
        let _: () = objc::msg_send![ns_window, setIgnoresMouseEvents: cocoa::base::NO];

        // Set collection behavior to allow the window on all spaces
        let _: () = objc::msg_send![ns_window, setCollectionBehavior: 1u64 << 0]; // NSWindowCollectionBehaviorCanJoinAllSpaces
    }
}

fn setup_system_tray(app: &tauri::App) -> tauri::Result<()> {
    use tauri::menu::{Menu, MenuItem};
    use tauri::tray::TrayIconBuilder;

    let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_item, &hide_item, &settings_item, &quit_item])?;

    TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Desktop Clippy")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                }
            }
            "hide" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            "settings" => {
                // TODO: open settings window
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_input_state,
            commands::update_character_bounds,
            commands::set_click_through,
            commands::request_accessibility,
            commands::read_ai_status,
            commands::load_config,
            commands::save_config,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            setup_macos_transparency(app);

            setup_system_tray(app)?;

            // Start keyboard/scroll event monitoring
            input::keyboard::start_event_monitor();

            // Start cursor position polling + click-through hit testing
            input::mouse::start_hit_test_polling(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
