import { useState } from 'react';
import { useClippyStore } from '../store';

export function FixedNote() {
  const { characterX, characterY, scale, pinnedNote, setPinnedNote } = useClippyStore();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(pinnedNote);

  const noteX = characterX + (48 * scale) / 2 - 50;
  const noteY = characterY - 44;

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
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div
        style={{
          position: 'fixed',
          left: noteX,
          top: noteY,
          background: '#fffde6',
          border: '2px solid #c8c080',
          padding: '4px 6px',
          fontFamily: '"Courier New", monospace',
          fontSize: 10,
          pointerEvents: 'auto',
          imageRendering: 'pixelated',
          boxShadow: '2px 2px 0px rgba(0,0,0,0.15)',
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
            fontFamily: '"Courier New", monospace',
            fontSize: 10,
            border: '1px solid #c8c080',
            background: '#fff',
            padding: '2px 4px',
            width: 120,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSave}
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: 9,
            background: '#e8e8d0',
            border: '1px solid #c8c080',
            cursor: 'pointer',
            padding: '1px 4px',
          }}
        >
          ok
        </button>
        <button
          onClick={handleRemove}
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: 9,
            background: '#ffe0e0',
            border: '1px solid #c08080',
            cursor: 'pointer',
            padding: '1px 4px',
            color: '#cc4444',
          }}
        >
          del
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
        background: '#fffde6',
        border: '2px solid #c8c080',
        padding: '3px 8px',
        fontFamily: '"Courier New", monospace',
        fontSize: 10,
        color: '#555',
        pointerEvents: 'auto',
        imageRendering: 'pixelated',
        boxShadow: '2px 2px 0px rgba(0,0,0,0.15)',
        zIndex: 9997,
        cursor: 'pointer',
        maxWidth: 160,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {truncated}
    </div>
  );
}
