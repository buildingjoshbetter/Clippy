let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playBlip(frequency = 440, duration = 0.05, volume = 0.1) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playDing() {
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    setTimeout(() => playBlip(freq, 0.15, 0.08), i * 100);
  });
}

export function playAlert() {
  [880, 660, 880].forEach((freq, i) => {
    setTimeout(() => playBlip(freq, 0.1, 0.08), i * 150);
  });
}

export function playHiss(duration = 0.5) {
  const ctx = getCtx();
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.03;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}

export function playStretch() {
  [330, 392, 440, 523].forEach((freq, i) => {
    setTimeout(() => playBlip(freq, 0.2, 0.06), i * 200);
  });
}
