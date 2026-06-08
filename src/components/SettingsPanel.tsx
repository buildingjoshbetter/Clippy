import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useClippyStore } from '../store';

interface Props {
  onClose: () => void;
}

interface Config {
  // Appearance
  scale: number;
  characterVariant: string;
  showSpeechBubbles: boolean;
  soundEnabled: boolean;
  volume: number;
  // Behavior
  enableEyeFollow: boolean;
  enableChase: boolean;
  enableOverheat: boolean;
  enablePaperUnroll: boolean;
  idleTimeoutMin: number;
  // Stretch
  stretchEnabled: boolean;
  stretchIntervalMin: number;
  // Pomodoro
  focusDurationMin: number;
  breakDurationMin: number;
  longBreakDurationMin: number;
  // AI Integration
  aiEnabled: boolean;
  aiTools: {
    claudeCode: boolean;
    codex: boolean;
    cursor: boolean;
    kiro: boolean;
  };
  // Personal
  userName: string;
  pinnedNote: string;
}

const DEFAULT_CONFIG: Config = {
  scale: 3,
  characterVariant: 'classic',
  showSpeechBubbles: true,
  soundEnabled: true,
  volume: 70,
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

const VARIANTS = ['classic', 'gold', 'dark', 'neon', 'rusty', 'rainbow'];

export function SettingsPanel({ onClose }: Props) {
  const store = useClippyStore();
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  useEffect(() => {
    invoke<Config>('load_config')
      .then((loaded) => {
        setConfig({ ...DEFAULT_CONFIG, ...loaded });
      })
      .catch(() => {
        // Use defaults if Tauri command not available
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
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 16,
    borderBottom: '1px solid #d4d0b8',
    paddingBottom: 12,
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 11,
    color: '#444',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: '"Courier New", monospace',
    fontSize: 11,
    border: '2px solid #c8c080',
    background: '#fff',
    padding: '3px 6px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    width: 'auto',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.25)',
        pointerEvents: 'auto',
        zIndex: 10001,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#fffde6',
          border: '3px solid #8b7e4b',
          padding: '16px 20px',
          fontFamily: '"Courier New", monospace',
          fontSize: 11,
          color: '#333',
          width: 360,
          maxHeight: '80vh',
          overflowY: 'auto',
          imageRendering: 'pixelated',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: 2 }}>SETTINGS</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '2px solid #999',
              fontFamily: '"Courier New", monospace',
              fontSize: 14,
              cursor: 'pointer',
              padding: '0 6px',
              lineHeight: '18px',
              color: '#666',
            }}
          >
            x
          </button>
        </div>

        {/* Appearance */}
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
              style={{ width: 100 }}
            />
          </div>
          <div style={labelStyle}>
            <span>Variant</span>
            <select
              value={config.characterVariant}
              onChange={(e) => updateConfig({ characterVariant: e.target.value })}
              style={selectStyle}
            >
              {VARIANTS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div style={labelStyle}>
            <span>Show speech bubbles</span>
            <input
              type="checkbox"
              checked={config.showSpeechBubbles}
              onChange={(e) => updateConfig({ showSpeechBubbles: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Sound enabled</span>
            <input
              type="checkbox"
              checked={config.soundEnabled}
              onChange={(e) => updateConfig({ soundEnabled: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Volume ({config.volume})</span>
            <input
              type="range"
              min={0}
              max={100}
              value={config.volume}
              onChange={(e) => updateConfig({ volume: Number(e.target.value) })}
              style={{ width: 100 }}
            />
          </div>
        </div>

        {/* Behavior */}
        <div style={sectionStyle}>
          <div style={headingStyle}>Behavior</div>
          <div style={labelStyle}>
            <span>Enable eye follow</span>
            <input
              type="checkbox"
              checked={config.enableEyeFollow}
              onChange={(e) => updateConfig({ enableEyeFollow: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Enable chase</span>
            <input
              type="checkbox"
              checked={config.enableChase}
              onChange={(e) => updateConfig({ enableChase: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Enable overheat</span>
            <input
              type="checkbox"
              checked={config.enableOverheat}
              onChange={(e) => updateConfig({ enableOverheat: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Enable paper unroll</span>
            <input
              type="checkbox"
              checked={config.enablePaperUnroll}
              onChange={(e) => updateConfig({ enablePaperUnroll: e.target.checked })}
            />
          </div>
          <div style={labelStyle}>
            <span>Idle timeout (min)</span>
            <input
              type="number"
              min={1}
              max={60}
              value={config.idleTimeoutMin}
              onChange={(e) => updateConfig({ idleTimeoutMin: Number(e.target.value) })}
              style={{ ...inputStyle, width: 50 }}
            />
          </div>
        </div>

        {/* Stretch */}
        <div style={sectionStyle}>
          <div style={headingStyle}>Stretch</div>
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
              style={{ ...inputStyle, width: 50 }}
            />
          </div>
        </div>

        {/* Pomodoro */}
        <div style={sectionStyle}>
          <div style={headingStyle}>Pomodoro</div>
          <div style={labelStyle}>
            <span>Focus (min)</span>
            <input
              type="number"
              min={1}
              max={120}
              value={config.focusDurationMin}
              onChange={(e) => updateConfig({ focusDurationMin: Number(e.target.value) })}
              style={{ ...inputStyle, width: 50 }}
            />
          </div>
          <div style={labelStyle}>
            <span>Break (min)</span>
            <input
              type="number"
              min={1}
              max={60}
              value={config.breakDurationMin}
              onChange={(e) => updateConfig({ breakDurationMin: Number(e.target.value) })}
              style={{ ...inputStyle, width: 50 }}
            />
          </div>
          <div style={labelStyle}>
            <span>Long break (min)</span>
            <input
              type="number"
              min={1}
              max={60}
              value={config.longBreakDurationMin}
              onChange={(e) => updateConfig({ longBreakDurationMin: Number(e.target.value) })}
              style={{ ...inputStyle, width: 50 }}
            />
          </div>
        </div>

        {/* AI Integration */}
        <div style={sectionStyle}>
          <div style={headingStyle}>AI Integration</div>
          <div style={labelStyle}>
            <span>Enabled</span>
            <input
              type="checkbox"
              checked={config.aiEnabled}
              onChange={(e) => updateConfig({ aiEnabled: e.target.checked })}
            />
          </div>
          <div style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <span style={{ marginBottom: 4 }}>Tools:</span>
            {(['claudeCode', 'codex', 'cursor', 'kiro'] as const).map((tool) => (
              <label key={tool} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
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

        {/* Personal */}
        <div style={{ marginBottom: 8 }}>
          <div style={headingStyle}>Personal</div>
          <div style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ marginBottom: 4 }}>Your name</span>
            <input
              type="text"
              value={config.userName}
              onChange={(e) => updateConfig({ userName: e.target.value })}
              placeholder="Enter your name..."
              style={inputStyle}
            />
          </div>
          <div style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }}>
            <span style={{ marginBottom: 4 }}>Pinned note</span>
            <input
              type="text"
              value={config.pinnedNote}
              onChange={(e) => updateConfig({ pinnedNote: e.target.value })}
              placeholder="Pin a note above clippy..."
              maxLength={50}
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
