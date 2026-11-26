// 🌳 Công viên: bầu trời + đồi, bãi cỏ có đường mòn, cây, bụi hoa, ghế, đèn, hồ, đài phun nước.
import { mulberry32 } from '../rng.js';
import { hash, circle, oval, rrect, shadow, fillArea, vgrad, cloud, sun } from './common.js';
import { scatterProps } from './layout.js';
import { tree, bush, bench, lamp, flowerpot, tuft, flower, BLOOM } from './props.js';

const SPECS = [
  { type: 'tree', w: 2, h: 2, weight: 5 },
  { type: 'bush', w: 1, h: 1, weight: 5 },
  { type: 'bench', w: 2, h: 1, weight: 3 },
  { type: 'lamp', w: 1, h: 1, weight: 2 },
  { type: 'flowerbed', w: 2, h: 1, weight: 2 },
  { type: 'pond', w: 3, h: 2, weight: 1, max: 2 },
  { type: 'fountain', w: 3, h: 3, weight: 1, max: 1 },
];

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#9fd8ff', '#e3f5ff']);
  ctx.fillRect(0, 0, w, top);
  sun(ctx, w - 120, top * 0.32, top * 0.14);
  for (let i = 0; i * 380 < w; i++) cloud(ctx, i * 380 + 60 + hash(i, 1) * 160, top * (0.18 + hash(i, 2) * 0.22), 0.8 + hash(i, 3) * 0.5);
  for (let x = -100; x < w + 200; x += 320) oval(ctx, x + hash(x, 4) * 80, top, 230, top * 0.5, '#8cc97a', false);
  for (let x = 10; x < w; x += 44) circle(ctx, x, top - 12 - hash(x, 5) * 14, 22, '#5fa851', false);
}

// Hai con đường mòn uốn lượn ngang bản đồ (cố định theo seed).
function paths(ctx, scene) {
  const rnd = mulberry32(scene.seed + 101);
  const span = scene.height - scene.top;
  ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    const y0 = scene.top + span * (0.2 + i * 0.5 + rnd() * 0.15);
    const y1 = scene.top + span * (0.2 + i * 0.5 + rnd() * 0.2);
    ctx.beginPath();
    ctx.moveTo(-50, y0);
    ctx.bezierCurveTo(scene.width * 0.33, y0 - span * 0.2, scene.width * 0.66, y1 + span * 0.2, scene.width + 50, y1);
    ctx.strokeStyle = '#d9c08a';
    ctx.lineWidth = 78;
    ctx.stroke();
    ctx.strokeStyle = '#efdcae';
    ctx.lineWidth = 66;
    ctx.stroke();
  }
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#a8d88a');
  paths(ctx, scene);
}

function fountain(ctx, p) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h * 0.66;
  shadow(ctx, cx, cy + 14, p.w * 0.47, p.h * 0.2);
  oval(ctx, cx, cy, p.w * 0.45, p.h * 0.2, '#cbd5e1');
  oval(ctx, cx, cy, p.w * 0.37, p.h * 0.14, '#7cc4f0', false);
  rrect(ctx, cx - 10, cy - p.h * 0.4, 20, p.h * 0.4, 6, '#cbd5e1');
  oval(ctx, cx, cy - p.h * 0.4, 32, 10, '#cbd5e1');
  ctx.strokeStyle = '#bfe6ff';
  ctx.lineWidth = 6;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - p.h * 0.43);
    ctx.quadraticCurveTo(cx + side * 50, cy - p.h * 0.66, cx + side * 62, cy - 6);
    ctx.stroke();
  }
}

function pond(ctx, p) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h * 0.55;
  oval(ctx, cx, cy, p.w * 0.46, p.h * 0.38, '#7cc4f0');
  oval(ctx, cx - 14, cy - 10, p.w * 0.28, p.h * 0.18, 'rgba(255,255,255,0.3)', false);
  for (let i = 0; i < 3; i++) oval(ctx, cx - 50 + i * 45, cy + 18 - hash(i, p.v) * 30, 13, 8, '#4fa34f');
  oval(ctx, cx + 30, cy - 4, 16, 11, '#fde047');
  circle(ctx, cx + 42, cy - 16, 8, '#fde047');
  oval(ctx, cx + 52, cy - 15, 5, 3, '#fb923c', false);
  circle(ctx, cx + 44, cy - 18, 1.6, '#111', false);
}

function flowerbed(ctx, p) {
  const x = p.x + 6;
  const w = p.w - 12;
  shadow(ctx, p.x + p.w / 2, p.y + p.h - 12, w / 2, 7);
  rrect(ctx, x, p.y + p.h * 0.35, w, p.h * 0.45, 10, '#8b5a3c');
  for (let i = 0; i < 9; i++) {
    const fx = x + 10 + (i % 5) * ((w - 20) / 4) + (i > 4 ? 12 : 0);
    const fy = p.y + p.h * (i > 4 ? 0.62 : 0.45);
    circle(ctx, fx, fy, 6, BLOOM[Math.floor(hash(i, p.v) * BLOOM.length)], true, 1.5);
  }
}

export default {
  key: 'park',
  name: 'Công viên',
  icon: '🌳',
  topBand: 2,
  propShare: 0.3,
  decorDensity: 1,
  decorTypes: ['tuft', 'tuft', 'flower'],
  decorColors: ['#ffffff', '#fde047', '#f9a8d4', '#c4b5fd', '#fca5a5'],
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { tree, bush, bench, lamp, flowerpot, fountain, pond, flowerbed },
  decor: { tuft, flower },
};
