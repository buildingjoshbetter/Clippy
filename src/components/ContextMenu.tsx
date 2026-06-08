import { useState } from 'react';
import { useClippyStore } from '../store';

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export function ContextMenu() {
  const store = useClippyStore();
  const [subMenu, setSubMenu] = useState<'reminder' | 'note' | 'pomodoro' | null>(null);
  const [reminderText, setReminderText] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(5);
  const [reminderMode, setReminderMode] = useState<'in' | 'at'>('in');
  const [reminderTime, setReminderTime] = useState('');
  const [noteText, setNoteText] = useState('');

  const { contextMenuX, contextMenuY, closeContextMenu } = store;

  const menuItemStyle: React.CSSProperties = {
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: FONT,
    whiteSpace: 'nowrap',
    borderRadius: 6,
    margin: '1px 4px',
    transition: 'background 0.1s',
    color: '#222',
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 12,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 6,
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '5px 8px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const btnStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 11,
    borderRadius: 6,
    cursor: 'pointer',
    padding: '4px 12px',
    border: 'none',
    fontWeight: 500,
  };

  const handleSetReminder = () => {
    if (!reminderText.trim()) return;
    let triggerAt: number;
    if (reminderMode === 'in') {
      triggerAt = Date.now() + reminderMinutes * 60 * 1000;
    } else {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
      triggerAt = target.getTime();
    }
    store.addReminder(reminderText.trim(), triggerAt);
    setReminderText('');
    setReminderMinutes(5);
    setReminderTime('');
    closeContextMenu();
  };

  const handlePinNote = () => {
    if (noteText.trim()) {
      store.setPinnedNote(noteText.trim());
      setNoteText('');
      closeContextMenu();
    }
  };

  const handleStartFocus = () => {
    store.setPomodoroState('focus', 25 * 60 * 1000);
    closeContextMenu();
  };

  const handleStartBreak = () => {
    store.setPomodoroState('break', 5 * 60 * 1000);
    closeContextMenu();
  };

  const handleStopPomodoro = () => {
    store.setPomodoroState('idle', 0);
    closeContextMenu();
  };

  const handleStretchNow = () => {
    store.setStretchActive(true);
    closeContextMenu();
  };

  const handleSettings = () => {
    store.setSettingsOpen(true);
    closeContextMenu();
  };

  const handleAbout = () => {
    store.showSpeech('Clippy v1.0 — Your desktop companion', 'tip', 4000);
    closeContextMenu();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'auto',
        zIndex: 10002,
      }}
      onClick={closeContextMenu}
    >
      <div
        style={{
          position: 'fixed',
          left: contextMenuX - 200,
          top: contextMenuY,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08)',
          minWidth: 190,
          padding: '4px 0',
          fontFamily: FONT,
          animation: 'menuIn 0.12s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {subMenu === null && (
          <>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={() => setSubMenu('reminder')}
            >
              Set Reminder...
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={() => setSubMenu('note')}
            >
              Pin Note...
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={() => setSubMenu('pomodoro')}
            >
              Pomodoro
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleStretchNow}
            >
              Stretch Now
            </div>
            <div style={{ height: 1, background: 'rgba(0, 0, 0, 0.08)', margin: '4px 8px' }} />
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleSettings}
            >
              Settings...
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleAbout}
            >
              About Clippy
            </div>
          </>
        )}

        {subMenu === 'reminder' && (
          <div style={{ padding: '10px 14px', minWidth: 210 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 8, letterSpacing: 0.3 }}>
              Set Reminder
            </div>
            <input
              type="text"
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              placeholder="What should I remind you?"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSetReminder()}
              style={{ ...inputStyle, marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
              <button
                onClick={() => setReminderMode('in')}
                style={{
                  ...btnStyle,
                  flex: 1,
                  background: reminderMode === 'in' ? '#007aff' : 'rgba(0, 0, 0, 0.06)',
                  color: reminderMode === 'in' ? '#fff' : '#555',
                }}
              >
                In minutes
              </button>
              <button
                onClick={() => setReminderMode('at')}
                style={{
                  ...btnStyle,
                  flex: 1,
                  background: reminderMode === 'at' ? '#007aff' : 'rgba(0, 0, 0, 0.06)',
                  color: reminderMode === 'at' ? '#fff' : '#555',
                }}
              >
                At time
              </button>
            </div>
            {reminderMode === 'in' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 10, color: '#555' }}>
                <span>In</span>
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  style={{ ...inputStyle, width: 55, textAlign: 'center' }}
                />
                <span>min</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 10, color: '#555' }}>
                <span>At</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  style={{ ...inputStyle, width: 110 }}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleSetReminder}
                style={{ ...btnStyle, background: '#007aff', color: '#fff' }}
              >
                Set
              </button>
              <button
                onClick={() => setSubMenu(null)}
                style={{ ...btnStyle, background: 'rgba(0, 0, 0, 0.06)', color: '#555' }}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {subMenu === 'note' && (
          <div style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 8, letterSpacing: 0.3 }}>
              Pin Note
            </div>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your note..."
              autoFocus
              maxLength={50}
              onKeyDown={(e) => e.key === 'Enter' && handlePinNote()}
              style={{ ...inputStyle, marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handlePinNote}
                style={{ ...btnStyle, background: '#007aff', color: '#fff' }}
              >
                Pin
              </button>
              <button
                onClick={() => setSubMenu(null)}
                style={{ ...btnStyle, background: 'rgba(0, 0, 0, 0.06)', color: '#555' }}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {subMenu === 'pomodoro' && (
          <div style={{ padding: '4px 0' }}>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleStartFocus}
            >
              Start Focus (25m)
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleStartBreak}
            >
              Start Break (5m)
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleStopPomodoro}
            >
              Stop
            </div>
            <div style={{ height: 1, background: 'rgba(0, 0, 0, 0.08)', margin: '4px 8px' }} />
            <div
              style={{ ...menuItemStyle, color: '#888', fontSize: 12 }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.06)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={() => setSubMenu(null)}
            >
              Back
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes menuIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
