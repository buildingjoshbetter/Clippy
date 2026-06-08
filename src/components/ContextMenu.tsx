import { useState } from 'react';
import { useClippyStore } from '../store';

export function ContextMenu() {
  const store = useClippyStore();
  const [subMenu, setSubMenu] = useState<'reminder' | 'note' | 'pomodoro' | null>(null);
  const [reminderText, setReminderText] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(5);
  const [noteText, setNoteText] = useState('');

  const { contextMenuX, contextMenuY, closeContextMenu } = store;

  const menuItemStyle: React.CSSProperties = {
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 11,
    whiteSpace: 'nowrap',
  };

  const handleSetReminder = () => {
    if (reminderText.trim()) {
      const triggerAt = Date.now() + reminderMinutes * 60 * 1000;
      store.addReminder(reminderText.trim(), triggerAt);
      setReminderText('');
      setReminderMinutes(5);
      closeContextMenu();
    }
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
    store.showSpeech('Desktop Clippy v1.0 - Your pixel pal!', 'tip', 4000);
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
          left: contextMenuX,
          top: contextMenuY,
          background: '#fffde6',
          border: '2px solid #8b7e4b',
          fontFamily: '"Courier New", monospace',
          imageRendering: 'pixelated',
          boxShadow: '3px 3px 0px rgba(0,0,0,0.25)',
          minWidth: 180,
          padding: '4px 0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {subMenu === null && (
          <>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={() => setSubMenu('reminder')}
            >
              Set Reminder...
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={() => setSubMenu('note')}
            >
              Pin Note...
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={() => setSubMenu('pomodoro')}
            >
              Pomodoro &gt;
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleStretchNow}
            >
              Stretch Now
            </div>
            <div style={{ height: 1, background: '#d4d0b8', margin: '4px 8px' }} />
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleSettings}
            >
              Settings...
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleAbout}
            >
              About Desktop Clippy
            </div>
          </>
        )}

        {subMenu === 'reminder' && (
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 }}>SET REMINDER</div>
            <input
              type="text"
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              placeholder="Reminder text..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSetReminder()}
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 10,
                border: '2px solid #c8c080',
                background: '#fff',
                padding: '3px 6px',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 6,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, marginBottom: 6 }}>
              <span>In</span>
              <input
                type="number"
                min={1}
                max={480}
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 10,
                  border: '2px solid #c8c080',
                  background: '#fff',
                  padding: '2px 4px',
                  width: 40,
                  outline: 'none',
                }}
              />
              <span>min</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleSetReminder}
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 10,
                  background: '#e8e8d0',
                  border: '2px solid #c8c080',
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
              >
                Set
              </button>
              <button
                onClick={() => setSubMenu(null)}
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 10,
                  background: '#f0f0f0',
                  border: '2px solid #ccc',
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {subMenu === 'note' && (
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 }}>PIN NOTE</div>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Note text..."
              autoFocus
              maxLength={50}
              onKeyDown={(e) => e.key === 'Enter' && handlePinNote()}
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 10,
                border: '2px solid #c8c080',
                background: '#fff',
                padding: '3px 6px',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: 6,
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handlePinNote}
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 10,
                  background: '#e8e8d0',
                  border: '2px solid #c8c080',
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
              >
                Pin
              </button>
              <button
                onClick={() => setSubMenu(null)}
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 10,
                  background: '#f0f0f0',
                  border: '2px solid #ccc',
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
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
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleStartFocus}
            >
              Start Focus (25m)
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleStartBreak}
            >
              Start Break (5m)
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#e8e0b0')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
              onClick={handleStopPomodoro}
            >
              Stop
            </div>
            <div style={{ height: 1, background: '#d4d0b8', margin: '4px 8px' }} />
            <div
              style={{ ...menuItemStyle, color: '#888', fontSize: 10 }}
              onClick={() => setSubMenu(null)}
            >
              &lt; Back
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
