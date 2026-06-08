use std::fs;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

struct ToolDetector {
    name: &'static str,
    process_patterns: &'static [&'static str],
}

// Claude Code is handled via CLI hooks, not process detection
const TOOLS: &[ToolDetector] = &[
    ToolDetector {
        name: "codex",
        process_patterns: &["codex"],
    },
    ToolDetector {
        name: "cursor",
        process_patterns: &["Cursor Helper", "Cursor"],
    },
    ToolDetector {
        name: "kiro",
        process_patterns: &["kiro", "Kiro"],
    },
];

fn check_processes() -> Option<String> {
    let output = std::process::Command::new("ps")
        .args(["aux"])
        .output()
        .ok()?;
    let stdout = String::from_utf8_lossy(&output.stdout);

    for tool in TOOLS {
        for pattern in tool.process_patterns {
            if stdout.lines().any(|line| {
                line.contains(pattern) && !line.contains("grep") && !line.contains("desktop-clippy")
            }) {
                return Some(tool.name.to_string());
            }
        }
    }
    None
}

fn write_status(tool: &str, status: &str) {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let json = serde_json::json!({
        "tool": tool,
        "status": status,
        "timestamp": now,
    });

    if let Some(home) = dirs::home_dir() {
        let dir = home.join(".desktop-clippy");
        let _ = fs::create_dir_all(&dir);
        let _ = fs::write(
            dir.join("ai-status.json"),
            serde_json::to_string_pretty(&json).unwrap(),
        );
    }
}

pub fn start_process_watcher() {
    thread::spawn(|| {
        let mut was_active: Option<String> = None;

        loop {
            let active_tool = check_processes();

            let status_changed = match (&was_active, &active_tool) {
                (None, Some(_)) => true,
                (Some(_), None) => true,
                (Some(a), Some(b)) => a != b,
                _ => false,
            };

            if status_changed {
                // Don't overwrite hook-provided status (claude-code) if it was written recently
                if let Some(home) = dirs::home_dir() {
                    let status_path = home.join(".desktop-clippy").join("ai-status.json");
                    if let Ok(content) = fs::read_to_string(&status_path) {
                        if content.contains("\"claude-code\"") {
                            if let Ok(meta) = fs::metadata(&status_path) {
                                if let Ok(modified) = meta.modified() {
                                    if modified.elapsed().unwrap_or_default().as_secs() < 30 {
                                        was_active = active_tool;
                                        thread::sleep(Duration::from_secs(2));
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                }

                let status = if active_tool.is_some() {
                    "thinking"
                } else {
                    "done"
                };
                let tool_name = active_tool
                    .as_deref()
                    .unwrap_or(was_active.as_deref().unwrap_or("unknown"));

                write_status(tool_name, status);

                // After "done", wait 5 seconds then write "idle"
                if status == "done" {
                    let tool_for_idle = tool_name.to_string();
                    thread::spawn(move || {
                        thread::sleep(Duration::from_secs(5));
                        write_status(&tool_for_idle, "idle");
                    });
                }

                was_active = active_tool;
            } else {
                was_active = active_tool;
            }

            thread::sleep(Duration::from_secs(2));
        }
    });
}
