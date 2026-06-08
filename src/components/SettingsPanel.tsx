import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useClippyStore } from '../store';
import { getAllCharacters, getCharacter } from '../engine/characters';

interface Props {
  onClose: () => void;
}

interface Config {
  scale: number;
  characterVariant: string;
  showSpeechBubbles: boolean;
  soundEnabled: boolean;
  volume: number;
  coinVolume: number;
  enableEyeFollow: boolean;
  enableChase: boolean;
  enableOverheat: boolean;
  enablePaperUnroll: boolean;
  idleTimeoutMin: number;
  stretchEnabled: boolean;
  stretchIntervalMin: number;
  focusDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  aiEnabled: boolean;
  aiTools: {
    claudeCode: boolean;
    codex: boolean;
    cursor: boolean;
    kiro: boolean;
  };
  userName: string;
  pinnedNote: string;
}

const DEFAULT_CONFIG: Config = {
  scale: 3,
  characterVariant: 'clippy',
  showSpeechBubbles: true,
  soundEnabled: true,
  volume: 70,
  coinVolume: 10,
  enableEyeFollow: true,
  enableChase: true,
  enableOverheat: true,
  enablePaperUnroll: true,
  idleTimeoutMin: 5,
  stretchEnabled: true,
  stretchIntervalMin: 45,
  focusDurationMin: 25,
  breakDurationMin: 5,
  longBreakDurationMin: 15,
  aiEnabled: false,
  aiTools: { claudeCode: false, codex: false, cursor: false, kiro: false },
  userName: '',
  pinnedNote: '',
};

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

function CharacterThumbnail({ id, selected, onClick }: { id: string; selected: boolean; onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const char = getCharacter(id);
    const size = 48;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const s = size / char.nativeSize * 0.8;
    ctx.scale(s, s);
    char.draw(ctx, { eyeOffsetX: 0, eyeOffsetY: 0, bodyTilt: 0, bodySquash: 1, bodyStretch: 1, animState: 'idle', time: 1000 });
    ctx.restore();
  }, [id]);

  return (
    <div
      onClick={onClick}
      style={{
        width: 52,
        height: 52,
        borderRadius: 8,
        border: selected ? '2px solid #007aff' : '2px solid transparent',
        background: selected ? 'rgba(0, 122, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <canvas ref={canvasRef} width={48} height={48} style={{ width: 48, height: 48 }} />
    </div>
  );
}

export function SettingsPanel({ onClose }: Props) {
  const store = useClippyStore();
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  useEffect(() => {
    invoke<Config>('load_config')
      .then((loaded) => {
        setConfig({ ...DEFAULT_CONFIG, ...loaded });
      })
      .catch(() => {
        setConfig({
          ...DEFAULT_CONFIG,
          scale: store.scale,
          characterVariant: store.characterVariant,
          userName: store.userName,
          pinnedNote: store.pinnedNote,
        });
      });
  }, []);

  const updateConfig = (partial: Partial<Config>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    invoke('save_config', { config: updated }).catch(() => {});

    if (partial.scale !== undefined) store.setScale(partial.scale);
    if (partial.characterVariant !== undefined) store.setCharacterVariant(partial.characterVariant);
    if (partial.userName !== undefined) store.setUserName(partial.userName);
    if (partial.pinnedNote !== undefined) store.setPinnedNote(partial.pinnedNote);
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 13,
    color: '#333',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 13,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 6,
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '6px 10px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)',
        pointerEvents: 'auto',
        zIndex: 10001,
        animation: 'settingsOverlayIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 14,
          padding: '20px 24px',
          fontFamily: FONT,
          fontSize: 13,
          color: '#333',
          width: 380,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          animation: 'settingsIn 0.2s ease-out',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Settings</div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0, 0, 0, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              fontSize: 14,
              cursor: 'pointer',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT,
            }}
          >
            x
          </button>
        </div>

        <div style={sectionStyle}>
          <div style={headingStyle}>Appearance</div>
          <div style={labelStyle}>
            <span>Scale ({config.scale})</span>
            <input
              type="range"
              min={1}
              max={5}
              value={config.scale}
              onChange={(e) => updateConfig({ scale: Number(e.target.value) })}
              style={{ width: 120 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#333', display: 'block', marginBottom: 8 }}>Character</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {getAllCharacters().map((c) => (
                <CharacterThumbnail
                  key={c.id}
                  id={c.id}
                  selected={config.characterVariant === c.id}
                  onClick={() => updateConfig({ characterVariant: c.id })}
                />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>
              {getCharacter(config.characterVariant).name} — {getCharacter(config.characterVariant).description}
            </div>
          </div>
          <div style={labelStyle}>
            <span>Speech bubbles</span>
            <input
              type="checkbox"
              checked={config.showSpeechBubbles}
              onChange={(e) => updateConfig({ showSpeechBubbles: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Sound</span>
            <input
              type="checkbox"
              checked={config.soundEnabled}
              onChange={(e) => updateConfig({ soundEnabled: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Volume ({config.volume}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={config.volume}
              onChange={(e) => updateConfig({ volume: Number(e.target.value) })}
              style={{ width: 120 }}
            />
          </div>
          <div style={labelStyle}>
            <span>Notification sound ({config.coinVolume}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={config.coinVolume}
              onChange={(e) => updateConfig({ coinVolume: Number(e.target.value) })}
              style={{ width: 120 }}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={headingStyle}>Behavior</div>
          {[
            ['Eye follow', 'enableEyeFollow'],
            ['Chase cursor', 'enableChase'],
            ['Typing overheat', 'enableOverheat'],
            ['Scroll reaction', 'enablePaperUnroll'],
          ].map(([label, key]) => (
            <div key={key} style={labelStyle}>
              <span>{label}</span>
              <input
                type="checkbox"
                checked={config[key as keyof Config] as boolean}
                onChange={(e) => updateConfig({ [key]: e.target.checked })}
              />
            </div>
          ))}
          <div style={labelStyle}>
            <span>Idle timeout (min)</span>
            <input
              type="number"
              min={1}
              max={60}
              value={config.idleTimeoutMin}
              onChange={(e) => updateConfig({ idleTimeoutMin: Number(e.target.value) })}
              style={{ ...inputStyle, width: 60, textAlign: 'center' }}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={headingStyle}>Stretch Reminders</div>
          <div style={labelStyle}>
            <span>Enabled</span>
            <input
              type="checkbox"
              checked={config.stretchEnabled}
              onChange={(e) => updateConfig({ stretchEnabled: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Interval (min)</span>
            <input
              type="number"
              min={15}
              max={120}
              value={config.stretchIntervalMin}
              onChange={(e) => updateConfig({ stretchIntervalMin: Number(e.target.value) })}
              style={{ ...inputStyle, width: 60, textAlign: 'center' }}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={headingStyle}>Pomodoro</div>
          {[
            ['Focus (min)', 'focusDurationMin', 1, 120],
            ['Break (min)', 'breakDurationMin', 1, 60],
            ['Long break (min)', 'longBreakDurationMin', 1, 60],
          ].map(([label, key, min, max]) => (
            <div key={key as string} style={labelStyle}>
              <span>{label as string}</span>
              <input
                type="number"
                min={min as number}
                max={max as number}
                value={config[key as keyof Config] as number}
                onChange={(e) => updateConfig({ [key as string]: Number(e.target.value) })}
                style={{ ...inputStyle, width: 60, textAlign: 'center' }}
              />
            </div>
          ))}
        </div>

        <div style={sectionStyle}>
          <div style={headingStyle}>AI Integration</div>
          <div style={labelStyle}>
            <span>Detect AI tools</span>
            <input
              type="checkbox"
              checked={config.aiEnabled}
              onChange={(e) => updateConfig({ aiEnabled: e.target.checked })}
            />
          </div>
          <div style={{ marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(['claudeCode', 'codex', 'cursor', 'kiro'] as const).map((tool) => (
              <label key={tool} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
                <input
                  type="checkbox"
                  checked={config.aiTools[tool]}
                  onChange={(e) =>
                    updateConfig({ aiTools: { ...config.aiTools, [tool]: e.target.checked } })
                  }
                  disabled={!config.aiEnabled}
                />
                {tool === 'claudeCode' ? 'Claude Code' : tool.charAt(0).toUpperCase() + tool.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div style={headingStyle}>Personal</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Your name</div>
            <input
              type="text"
              value={config.userName}
              onChange={(e) => updateConfig({ userName: e.target.value })}
              placeholder="Enter your name..."
              style={inputStyle}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Pinned note</div>
            <input
              type="text"
              value={config.pinnedNote}
              onChange={(e) => updateConfig({ pinnedNote: e.target.value })}
              placeholder="Pin a note above your buddy..."
              maxLength={50}
              style={inputStyle}
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes settingsOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes settingsIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
