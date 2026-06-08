mod commands;
mod input;
mod process;

use tauri::{Emitter, Manager};

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

        // Start with click-through; hit-test loop will enable events over interactive regions
        let _: () = objc::msg_send![ns_window, setIgnoresMouseEvents: cocoa::base::YES];

        // Set collection behavior to allow the window on all spaces
        let _: () = objc::msg_send![ns_window, setCollectionBehavior: 1u64 << 0]; // NSWindowCollectionBehaviorCanJoinAllSpaces
    }
}

fn setup_system_tray(app: &tauri::App) -> tauri::Result<()> {
    use tauri::image::Image;
    use tauri::menu::{Menu, MenuItem};
    use tauri::tray::TrayIconBuilder;

    let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit Clippy", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;

    let tray_icon = Image::new_owned(
        include_bytes!("../icons/tray-icon-44x44.rgba").to_vec(),
        44, 44,
    );

    TrayIconBuilder::new()
        .icon(tray_icon)
        .icon_as_template(true)
        .menu(&menu)
        .tooltip("Clippy")
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
            commands::update_interactive_regions,
            commands::set_click_through,
            commands::request_accessibility,
            commands::retry_event_monitor,
            commands::read_ai_status,
            commands::get_ai_tool_status,
            commands::load_config,
            commands::save_config,
            commands::set_force_interactive,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            setup_macos_transparency(app);

            setup_system_tray(app)?;

            // Re-assert always-on-top periodically and on focus changes
            let window = app.get_webview_window("main").unwrap();
            window.on_window_event(move |event| {
                match event {
                    tauri::WindowEvent::Focused(_) | tauri::WindowEvent::Resized(_) => {
                        // Re-assert overlay state after focus/resize events
                    }
                    _ => {}
                }
            });

            // Periodically re-assert always-on-top (handles fullscreen/Mission Control recovery)
            let app_handle_overlay = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    if let Some(w) = app_handle_overlay.get_webview_window("main") {
                        let _ = w.set_always_on_top(true);
                    }
                }
            });

            // Start keyboard/scroll event monitoring
            input::keyboard::start_event_monitor();

            // Start cursor position polling + click-through hit testing
            input::mouse::start_hit_test_polling(app.handle().clone());

            // Start AI tool process watcher
            process::watcher::start_process_watcher();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
