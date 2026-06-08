export const SPEECH_LINES: Record<string, string[]> = {
  greeting: [
    "Hi! I'm Clippy. Right-click me for options!",
    "Ready to code, {name}?",
    "It looks like you're starting your day!",
  ],
  thinking: [
    "Hmm, let me think about this too...",
    "Processing... beep boop...",
    "This is a tricky one!",
    "Still working on it...",
    "Almost there... I think...",
  ],
  victory: [
    "Nailed it!",
    "Task complete!",
    "Another one bites the dust!",
    "That was fast!",
    "Done! Ship it!",
  ],
  overheat: [
    "Slow down! My circuits are melting!",
    "Easy there, speed demon!",
    "THERMAL THROTTLING ENGAGED!",
    "I can smell the metal burning!",
  ],
  stretch: [
    "Time to stretch, {name}!",
    "Your body will thank you!",
    "Stand up! Touch your toes!",
    "Unclip yourself from that chair!",
  ],
  idle: [
    "Quiet around here...",
    "I'm bored. Write some code!",
    "Did you know I'm made of metal?",
    "It looks like you're procrastinating!",
    "*taps foot impatiently*",
    "I could be holding papers together right now...",
  ],
  petting: [
    "That's nice!",
    "Right there!",
    "I'm a paperclip, but I appreciate this.",
    "Keep going...",
    "Mmm...",
  ],
  sleeping: [
    "zzz...",
    "*snore*",
    "Five more minutes...",
  ],
  chase: [
    "Wait up!",
    "I'm coming!",
    "Slow down!",
  ],
  scroll: [
    "That's a lot of code!",
    "Scrolling through the matrix...",
    "Where are you going?",
  ],
  typing: [
    "Clicky clicky!",
    "Type type type...",
    "Nice keystrokes!",
  ],
};

export function getRandomLine(category: string, userName?: string): string {
  const lines = SPEECH_LINES[category];
  if (!lines || lines.length === 0) return '';
  const line = lines[Math.floor(Math.random() * lines.length)];
  return line.replace('{name}', userName || 'friend');
}
