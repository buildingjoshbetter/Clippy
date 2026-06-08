import { useState } from 'react';
import { useClippyStore } from '../store';

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export function FixedNote() {
  const { characterX, characterY, scale, pinnedNote, setPinnedNote } = useClippyStore();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(pinnedNote);

  const half = (48 * scale) / 2;
  const noteX = characterX - 80;
  const noteY = characterY - half - 44;

  const truncated = pinnedNote.length > 50 ? pinnedNote.slice(0, 47) + '...' : pinnedNote;

  const handleClick = () => {
    setEditText(pinnedNote);
    setEditing(true);
  };

  const handleSave = () => {
    setPinnedNote(editText);
    setEditing(false);
  };

  const handleRemove = () => {
    setPinnedNote('');
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <div
        style={{
          position: 'fixed',
          left: noteX,
          top: noteY,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
          padding: '6px 8px',
          fontFamily: FONT,
          fontSize: 12,
          pointerEvents: 'auto',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 9997,
          display: 'flex',
          gap: 4,
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          maxLength={50}
          style={{
            fontFamily: FONT,
            fontSize: 12,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 5,
            background: '#fff',
            padding: '3px 6px',
            width: 130,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSave}
          style={{
            fontFamily: FONT,
            fontSize: 10,
            fontWeight: 500,
            background: '#007aff',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            padding: '3px 8px',
          }}
        >
          Save
        </button>
        <button
          onClick={handleRemove}
          style={{
            fontFamily: FONT,
            fontSize: 10,
            fontWeight: 500,
            background: 'rgba(255, 59, 48, 0.1)',
            color: '#ff3b30',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            padding: '3px 8px',
          }}
        >
          Del
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: noteX,
        top: noteY,
        background: 'rgba(255, 252, 230, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 6,
        padding: '4px 10px',
        fontFamily: FONT,
        fontSize: 11,
        color: '#444',
        pointerEvents: 'auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        zIndex: 9997,
        cursor: 'pointer',
        maxWidth: 180,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {truncated}
    </div>
  );
}
