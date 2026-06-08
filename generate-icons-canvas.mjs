import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';

function squircle(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawParrot(ctx, size) {
  const s = size / 128;
  ctx.save();
  ctx.scale(s, s);

  ctx.fillStyle = '#dc3545';
  squircle(ctx, 2, 2, 124, 124, 28);
  ctx.fill();

  const ig = ctx.createRadialGradient(64, 50, 10, 64, 64, 70);
  ig.addColorStop(0, 'rgba(255,255,255,0.08)');
  ig.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ig;
  squircle(ctx, 2, 2, 124, 124, 28);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(66, 108, 30, 8, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#8B5E3C';
  ctx.beginPath();
  ctx.moveTo(22, 103); ctx.quadraticCurveTo(64, 96, 106, 103);
  ctx.lineTo(106, 108); ctx.quadraticCurveTo(64, 101, 22, 108);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#6d4830';
  ctx.beginPath();
  ctx.moveTo(22, 106); ctx.quadraticCurveTo(64, 102, 106, 106);
  ctx.lineTo(106, 108); ctx.quadraticCurveTo(64, 104, 22, 108);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(28, 104); ctx.quadraticCurveTo(64, 98, 100, 104);
  ctx.stroke();

  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.moveTo(48, 92); ctx.quadraticCurveTo(28, 106, 32, 118);
  ctx.quadraticCurveTo(38, 110, 52, 98); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#1b5e20';
  ctx.beginPath();
  ctx.moveTo(44, 90); ctx.quadraticCurveTo(22, 102, 26, 114);
  ctx.quadraticCurveTo(32, 106, 48, 95); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#388e3c';
  ctx.beginPath();
  ctx.moveTo(52, 94); ctx.quadraticCurveTo(36, 110, 40, 118);
  ctx.quadraticCurveTo(44, 112, 55, 100); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  const bodyGrad = ctx.createRadialGradient(60, 65, 5, 64, 72, 30);
  bodyGrad.addColorStop(0, '#66bb6a');
  bodyGrad.addColorStop(0.6, '#4caf50');
  bodyGrad.addColorStop(1, '#388e3c');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath(); ctx.ellipse(64, 72, 22, 30, 0, 0, Math.PI * 2); ctx.fill();

  const bellyGrad = ctx.createRadialGradient(64, 78, 3, 64, 80, 20);
  bellyGrad.addColorStop(0, '#a5d6a7');
  bellyGrad.addColorStop(1, '#81c784');
  ctx.fillStyle = bellyGrad;
  ctx.beginPath(); ctx.ellipse(64, 80, 14, 20, 0, 0, Math.PI * 2); ctx.fill();

  const wingGrad = ctx.createLinearGradient(38, 50, 62, 90);
  wingGrad.addColorStop(0, '#43a047');
  wingGrad.addColorStop(1, '#2e7d32');
  ctx.fillStyle = wingGrad;
  ctx.beginPath(); ctx.ellipse(50, 70, 14, 22, 0.15, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(50, 60 + i * 7, 10 - i, 16 - i * 3, 0.15, 0.4, 2.7);
    ctx.stroke();
  }

  const headGrad = ctx.createRadialGradient(60, 38, 5, 64, 44, 20);
  headGrad.addColorStop(0, '#66bb6a');
  headGrad.addColorStop(0.7, '#4caf50');
  headGrad.addColorStop(1, '#43a047');
  ctx.fillStyle = headGrad;
  ctx.beginPath(); ctx.arc(64, 44, 20, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.ellipse(58, 36, 10, 8, -0.3, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 3;
  ctx.beginPath(); ctx.ellipse(72, 40, 10, 9, 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(72, 40, 10, 9, 0.05, 0, Math.PI * 2); ctx.stroke();

  const irisGrad = ctx.createRadialGradient(74, 39, 1, 74, 39, 6);
  irisGrad.addColorStop(0, '#1a1a1a');
  irisGrad.addColorStop(0.5, '#3d2b1a');
  irisGrad.addColorStop(0.7, '#5a3d20');
  irisGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = irisGrad;
  ctx.beginPath(); ctx.arc(74, 39, 5.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath(); ctx.arc(74, 39, 3, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(76.5, 36.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.arc(71.5, 41.5, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  const beakGrad = ctx.createLinearGradient(82, 40, 96, 48);
  beakGrad.addColorStop(0, '#ffb74d');
  beakGrad.addColorStop(0.5, '#ff9800');
  beakGrad.addColorStop(1, '#f57c00');
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(82, 41); ctx.bezierCurveTo(88, 39, 96, 41, 95, 46);
  ctx.bezierCurveTo(92, 47, 86, 47, 82, 46); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#e68a00';
  ctx.beginPath();
  ctx.moveTo(82, 47); ctx.bezierCurveTo(86, 47, 92, 48, 90, 52);
  ctx.bezierCurveTo(86, 53, 82, 51, 80, 49); ctx.closePath(); ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(82, 46.5); ctx.bezierCurveTo(86, 46, 92, 46.5, 94, 46.5);
  ctx.stroke();

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(87, 43.5, 1.3, 0.9, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ff6b35';
  ctx.beginPath();
  ctx.moveTo(57, 28); ctx.bezierCurveTo(55, 20, 56, 14, 59, 18);
  ctx.bezierCurveTo(60, 22, 61, 26, 61, 28); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.moveTo(61, 26); ctx.bezierCurveTo(60, 18, 62, 12, 65, 16);
  ctx.bezierCurveTo(66, 20, 65, 24, 64, 26); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#ffab00';
  ctx.beginPath();
  ctx.moveTo(64, 27); ctx.bezierCurveTo(65, 20, 68, 16, 70, 20);
  ctx.bezierCurveTo(70, 24, 68, 26, 66, 27); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#e8870e';
  ctx.beginPath();
  ctx.moveTo(55, 96); ctx.lineTo(52, 103); ctx.lineTo(59, 103); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(73, 96); ctx.lineTo(70, 103); ctx.lineTo(77, 103); ctx.closePath(); ctx.fill();

  ctx.lineCap = 'round';
  ctx.strokeStyle = '#e8870e';
  ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.moveTo(49, 103); ctx.lineTo(62, 103); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50, 101); ctx.lineTo(50, 105); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(62, 101); ctx.lineTo(62, 105); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(67, 103); ctx.lineTo(80, 103); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(68, 101); ctx.lineTo(68, 105); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(80, 101); ctx.lineTo(80, 105); ctx.stroke();

  ctx.restore();
}

function drawTrayParrot(ctx, size) {
  const s = size / 22;
  ctx.save(); ctx.scale(s, s);
  const c = '#444';

  ctx.fillStyle = c;
  ctx.strokeStyle = c;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath(); ctx.ellipse(11, 13, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(11, 6.5, 5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ddd';
  ctx.beginPath(); ctx.arc(13.5, 5.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.arc(14, 5.2, 0.8, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = c;
  ctx.beginPath(); ctx.moveTo(15.5, 5.5); ctx.lineTo(20, 6.5); ctx.lineTo(15.5, 8); ctx.closePath(); ctx.fill();

  ctx.beginPath(); ctx.moveTo(8.5, 2.5); ctx.lineTo(9.5, -0.5); ctx.lineTo(11, 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10, 2); ctx.lineTo(11.5, 0); ctx.lineTo(12.5, 2.5); ctx.closePath(); ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.ellipse(9, 13, 3.5, 5, 0.2, 0.5, 5.5); ctx.stroke();

  ctx.fillStyle = c;
  ctx.beginPath(); ctx.moveTo(7, 18); ctx.quadraticCurveTo(2, 20, 3, 22);
  ctx.quadraticCurveTo(5, 20, 8, 19); ctx.closePath(); ctx.fill();

  ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(9, 19.5); ctx.lineTo(7, 21.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9.5, 19.5); ctx.lineTo(11, 21.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(13, 19.5); ctx.lineTo(11.5, 21.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(13, 19.5); ctx.lineTo(15, 21.5); ctx.stroke();

  ctx.restore();
}

function renderPNG(drawFn, size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  return canvas.toBuffer('image/png');
}

const iconsDir = '/Users/j/Desktop/desktop-clippy/src-tauri/icons';
const iconsetDir = join(tmpdir(), 'clippy-icon.iconset');

if (existsSync(iconsetDir)) rmSync(iconsetDir, { recursive: true });
mkdirSync(iconsetDir, { recursive: true });

const iconSizes = {
  'icon_16x16.png': 16,
  'icon_16x16@2x.png': 32,
  'icon_32x32.png': 32,
  'icon_32x32@2x.png': 64,
  'icon_128x128.png': 128,
  'icon_128x128@2x.png': 256,
  'icon_256x256.png': 256,
  'icon_256x256@2x.png': 512,
  'icon_512x512.png': 512,
  'icon_512x512@2x.png': 1024,
};

console.log('Generating app icon sizes...');
for (const [name, size] of Object.entries(iconSizes)) {
  const png = renderPNG(drawParrot, size);
  writeFileSync(join(iconsetDir, name), png);
  console.log(`  ${name} (${size}x${size}) - ${png.length} bytes`);
}

console.log('\nConverting to .icns...');
execSync(`iconutil -c icns "${iconsetDir}" -o "${join(iconsDir, 'icon.icns')}"`);
console.log(`Generated ${join(iconsDir, 'icon.icns')}`);

for (const [name, size] of [['32x32.png', 32], ['128x128.png', 128], ['128x128@2x.png', 256]]) {
  const png = renderPNG(drawParrot, size);
  writeFileSync(join(iconsDir, name), png);
}
console.log('Saved bundle PNGs');

console.log('\nGenerating tray icon...');
const tray44 = createCanvas(44, 44);
const trayCtx = tray44.getContext('2d');
drawTrayParrot(trayCtx, 44);
const trayPng = tray44.toBuffer('image/png');

const imageData = trayCtx.getImageData(0, 0, 44, 44);
writeFileSync(join(iconsDir, 'tray-icon-44x44.rgba'), Buffer.from(imageData.data.buffer));
console.log(`Generated tray RGBA (${imageData.data.length} bytes)`);

writeFileSync(join(iconsDir, 'tray-icon.png'), trayPng);
const tray88 = createCanvas(88, 88);
drawTrayParrot(tray88.getContext('2d'), 88);
writeFileSync(join(iconsDir, 'tray-icon@2x.png'), tray88.toBuffer('image/png'));
console.log('Saved tray PNGs');

rmSync(iconsetDir, { recursive: true });
console.log('\nDone! All icons generated with full Canvas rendering quality.');
