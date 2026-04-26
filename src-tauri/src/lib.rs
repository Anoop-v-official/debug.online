use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

mod dns;
mod ssl;

#[derive(Clone, serde::Serialize)]
struct ClipboardSniff {
    kind: String,
    value: String,
}

fn sniff_clipboard(s: &str) -> Option<ClipboardSniff> {
    let trimmed = s.trim();
    if trimmed.is_empty() || trimmed.len() > 16_384 {
        return None;
    }
    // JWT — three base64url segments separated by dots
    if trimmed.matches('.').count() == 2
        && trimmed
            .split('.')
            .all(|p| !p.is_empty() && p.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_'))
    {
        return Some(ClipboardSniff {
            kind: "jwt-decode".into(),
            value: trimmed.to_string(),
        });
    }
    // Hex color
    let hex = trimmed.trim_start_matches('#');
    if (hex.len() == 3 || hex.len() == 6 || hex.len() == 8) && hex.chars().all(|c| c.is_ascii_hexdigit()) {
        return Some(ClipboardSniff {
            kind: "color-converter".into(),
            value: trimmed.to_string(),
        });
    }
    // UUID
    if trimmed.len() == 36
        && trimmed.chars().filter(|&c| c == '-').count() == 4
        && trimmed.chars().all(|c| c.is_ascii_hexdigit() || c == '-')
    {
        return Some(ClipboardSniff {
            kind: "uuid-generator".into(),
            value: trimmed.to_string(),
        });
    }
    // Unix timestamp
    if (trimmed.len() == 10 || trimmed.len() == 13) && trimmed.chars().all(|c| c.is_ascii_digit()) {
        return Some(ClipboardSniff {
            kind: "timestamp-converter".into(),
            value: trimmed.to_string(),
        });
    }
    // URL
    if (trimmed.starts_with("http://") || trimmed.starts_with("https://"))
        && !trimmed.contains(char::is_whitespace)
    {
        return Some(ClipboardSniff {
            kind: "url-parser".into(),
            value: trimmed.to_string(),
        });
    }
    // JSON
    if (trimmed.starts_with('{') && trimmed.ends_with('}'))
        || (trimmed.starts_with('[') && trimmed.ends_with(']'))
    {
        if serde_json::from_str::<serde_json::Value>(trimmed).is_ok() {
            return Some(ClipboardSniff {
                kind: "json-format".into(),
                value: trimmed.to_string(),
            });
        }
    }
    None
}

#[tauri::command]
async fn sniff_current_clipboard(text: String) -> Option<ClipboardSniff> {
    sniff_clipboard(&text)
}

fn show_main_window(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.show();
        let _ = win.unminimize();
        let _ = win.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    builder = builder.plugin(tauri_plugin_clipboard_manager::init());

    #[cfg(desktop)]
    {
        builder = builder.plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() != ShortcutState::Pressed {
                        return;
                    }
                    let target = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyD);
                    if shortcut == &target {
                        if let Some(win) = app.get_webview_window("main") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                show_main_window(app);
                                let _ = app.emit("focus-clipboard-sniff", ());
                            }
                        }
                    }
                })
                .build(),
        );
    }

    builder
        .invoke_handler(tauri::generate_handler![
            sniff_current_clipboard,
            dns::dns_lookup,
            ssl::ssl_check,
        ])
        .setup(|app| {
            // Register global shortcut: Super+Shift+D
            #[cfg(desktop)]
            {
                let shortcut = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyD);
                if let Err(e) = app.global_shortcut().register(shortcut) {
                    eprintln!("global-shortcut registration failed: {e}");
                }
            }

            // System tray
            let show_item = MenuItem::with_id(app, "show", "Show debug.online", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "Hide window", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;

            let _tray = TrayIconBuilder::with_id("main")
                .tooltip("debug.online — IT toolkit")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main_window(app),
                    "hide" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.hide();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
