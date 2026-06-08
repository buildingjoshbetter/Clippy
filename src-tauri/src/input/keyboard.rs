use std::os::raw::c_void;
use std::ptr;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::thread;
use std::time::{SystemTime, UNIX_EPOCH};

static LAST_KEYSTROKE_MS: AtomicU64 = AtomicU64::new(0);
static KEYSTROKE_COUNT: AtomicU64 = AtomicU64::new(0);
static LAST_SCROLL_MS: AtomicU64 = AtomicU64::new(0);
static SCROLL_COUNT: AtomicU64 = AtomicU64::new(0);
static MONITOR_RUNNING: AtomicBool = AtomicBool::new(false);

type CGEventTapProxy = *const c_void;
type CGEventRef = *const c_void;
type CFMachPortRef = *const c_void;
type CFRunLoopSourceRef = *const c_void;
type CFAllocatorRef = *const c_void;
type CFRunLoopRef = *const c_void;
type CFStringRef = *const c_void;

type CGEventTapCallBack = unsafe extern "C" fn(
    proxy: CGEventTapProxy,
    event_type: u32,
    event: CGEventRef,
    user_info: *mut c_void,
) -> CGEventRef;

extern "C" {
    fn CGEventTapCreate(
        tap: u32,
        place: u32,
        options: u32,
        events_of_interest: u64,
        callback: CGEventTapCallBack,
        user_info: *mut c_void,
    ) -> CFMachPortRef;

    fn CGEventTapEnable(tap: CFMachPortRef, enable: bool);

    fn CFMachPortCreateRunLoopSource(
        allocator: CFAllocatorRef,
        port: CFMachPortRef,
        order: i64,
    ) -> CFRunLoopSourceRef;

    fn CFRunLoopGetCurrent() -> CFRunLoopRef;
    fn CFRunLoopAddSource(rl: CFRunLoopRef, source: CFRunLoopSourceRef, mode: CFStringRef);
    fn CFRunLoopRun();
    fn AXIsProcessTrusted() -> bool;

    static kCFRunLoopCommonModes: CFStringRef;
    static kCFAllocatorDefault: CFAllocatorRef;
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

pub fn get_typing_stats() -> (u64, u64) {
    (
        LAST_KEYSTROKE_MS.load(Ordering::Relaxed),
        KEYSTROKE_COUNT.load(Ordering::Relaxed),
    )
}

pub fn get_scroll_stats() -> (u64, u64) {
    (
        LAST_SCROLL_MS.load(Ordering::Relaxed),
        SCROLL_COUNT.load(Ordering::Relaxed),
    )
}

pub fn is_accessibility_trusted() -> bool {
    unsafe { AXIsProcessTrusted() }
}

pub fn is_monitor_running() -> bool {
    MONITOR_RUNNING.load(Ordering::Relaxed)
}

unsafe extern "C" fn event_callback(
    _proxy: CGEventTapProxy,
    event_type: u32,
    event: CGEventRef,
    _user_info: *mut c_void,
) -> CGEventRef {
    match event_type {
        10 => {
            // kCGEventKeyDown
            LAST_KEYSTROKE_MS.store(now_ms(), Ordering::Relaxed);
            KEYSTROKE_COUNT.fetch_add(1, Ordering::Relaxed);
        }
        22 => {
            // kCGEventScrollWheel
            LAST_SCROLL_MS.store(now_ms(), Ordering::Relaxed);
            SCROLL_COUNT.fetch_add(1, Ordering::Relaxed);
        }
        _ => {}
    }
    event
}

pub fn start_event_monitor() -> bool {
    if !is_accessibility_trusted() {
        eprintln!("Accessibility permission not granted — keyboard monitoring disabled");
        return false;
    }

    if MONITOR_RUNNING.swap(true, Ordering::SeqCst) {
        return true; // Already running
    }

    thread::spawn(|| {
        unsafe {
            let event_mask: u64 = (1 << 10) | (1 << 22); // KeyDown | ScrollWheel

            let tap = CGEventTapCreate(
                0, // kCGHIDEventTap
                0, // kCGHeadInsertEventTap
                1, // kCGEventTapOptionListenOnly
                event_mask,
                event_callback,
                ptr::null_mut(),
            );

            if tap.is_null() {
                eprintln!("Failed to create CGEventTap");
                MONITOR_RUNNING.store(false, Ordering::Relaxed);
                return;
            }

            let source = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0);
            if source.is_null() {
                eprintln!("Failed to create run loop source");
                MONITOR_RUNNING.store(false, Ordering::Relaxed);
                return;
            }

            let run_loop = CFRunLoopGetCurrent();
            CFRunLoopAddSource(run_loop, source, kCFRunLoopCommonModes);
            CGEventTapEnable(tap, true);
            CFRunLoopRun();
        }
    });

    true
}
