// 🚀 Vũ trụ: bầu trời sao, hành tinh có vành đai, Trái Đất; mặt trăng với tên lửa, xe tự hành, cờ, hố thiên thạch, ăng-ten.
import { hash, pickBy, rrect, circle, oval, poly, line, shadow, fillArea, vgrad, cuteFace } from './common.js';
import { scatterProps } from './layout.js';
import { rock, PAIRS } from './props.js';

const SPECS = [
  { type: 'crater', w: 2, h: 1, weight: 5 },
  { type: 'rock', w: 1, h: 1, weight: 4 },
  { type: 'flag', w: 1, h: 1, weight: 2 },
  { type: 'dish', w: 1, h: 1, weight: 2 },
  { type: 'rover', w: 2, h: 1, weight: 2 },
  { type: 'rocket', w: 2, h: 2, weight: 1, max: 2 },
];

function stars(ctx, w, h, n) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < n; i++) ctx.fillRect(hash(i, 1) * w, hash(i, 2) * h, 2 + hash(i, 3) * 2, 2 + hash(i, 3) * 2);
}

function ringedPlanet(ctx, x, y, r) {
  circle(ctx, x, y, r, '#f9a8d4', false);
  cuteFace(ctx, x, y, r / 22);
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.8, r * 0.45, -0.3, 0, Math.PI * 2);
  ctx.stroke();
}

function earth(ctx, x, y, r) {
  circle(ctx, x, y, r, '#3b82f6', false);
  oval(ctx, x - r * 0.3, y - r * 0.2, r * 0.35, r * 0.25, '#22c55e', false);
  oval(ctx, x + r * 0.35, y + r * 0.3, r * 0.3, r * 0.2, '#22c55e', false);
  cuteFace(ctx, x, y, r / 20);
}

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#0b1026', '#312e81']);
  ctx.fillRect(0, 0, w, top);
  stars(ctx, w, top, Math.round(w / 8));
  for (let x = 200, i = 0; x < w; x += 800, i++) {
    if (i % 2) earth(ctx, x, top * 0.45, top * 0.22);
    else ringedPlanet(ctx, x, top * 0.45, top * 0.18);
  }
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#d4d4d8');
}

function crater(ctx, p) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h * 0.6;
  oval(ctx, cx, cy, p.w * 0.42, p.h * 0.28, '#a1a1aa');
  oval(ctx, cx, cy + 4, p.w * 0.32, p.h * 0.18, '#8b8b93', false);
}

function smallCrater(ctx, d) {
  oval(ctx, d.x, d.y, d.s * 0.8, d.s * 0.45, '#b4b4bb', false);
}

function flag(ctx, p) {
  const cx = p.x + p.w / 2 - 10;
  const base = p.y + p.h - 8;
  const [color, light] = pickBy(p.v, PAIRS);
  shadow(ctx, cx, base, 10, 3);
  line(ctx, cx, base, cx, p.y + 6, '#e5e7eb', 3);
  rrect(ctx, cx + 1, p.y + 8, 32, 20, 1, color);
  circle(ctx, cx + 17, p.y + 18, 5, light, false);
}

function dish(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 16, 4);
  line(ctx, cx, base, cx, base - 28, '#9ca3af', 4);
  ctx.beginPath();
  ctx.ellipse(cx, base - 34, 24, 14, -0.5, 0, Math.PI);
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.strokeStyle = '#3b2a22';
  ctx.lineWidth = 2;
  ctx.stroke();
  line(ctx, cx, base - 34, cx + 10, base - 52, '#9ca3af', 2);
  circle(ctx, cx + 10, base - 53, 3, '#ef4444', false);
}

function rover(ctx, p) {
  const x = p.x + 14;
  const w = p.w - 28;
  const base = p.y + p.h - 6;
  shadow(ctx, p.x + p.w / 2, base, w / 2, 5);
  rrect(ctx, x - 6, base - 52, w + 12, 8, 2, '#1d4ed8');
  rrect(ctx, x, base - 40, w, 20, 5, '#e5e7eb');
  line(ctx, x + w - 10, base - 40, x + w - 4, base - 60, '#9ca3af', 2);
  for (let i = 0; i < 3; i++) circle(ctx, x + 10 + (i * (w - 20)) / 2, base - 12, 9, '#374151');
}

function rocket(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 10;
  const bodyTop = p.y + 34;
  shadow(ctx, cx, base, 34, 8);
  poly(ctx, [[cx - 18, base - 34], [cx - 38, base], [cx - 18, base - 8]], '#ef4444');
  poly(ctx, [[cx + 18, base - 34], [cx + 38, base], [cx + 18, base - 8]], '#ef4444');
  rrect(ctx, cx - 18, bodyTop, 36, base - bodyTop - 6, 8, '#f8fafc');
  poly(ctx, [[cx - 18, bodyTop + 4], [cx, p.y + 2], [cx + 18, bodyTop + 4]], '#ef4444');
  circle(ctx, cx, bodyTop + 26, 10, '#60a5fa');
  rrect(ctx, cx - 18, base - 30, 36, 8, 2, '#ef4444', false);
}

export default {
  key: 'space',
  name: 'Vũ trụ',
  icon: '🚀',
  topBand: 3,
  propShare: 0.28,
  decorDensity: 0.5,
  decorTypes: ['crater'],
  decorColors: ['#b4b4bb'],
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { crater, rock, flag, dish, rover, rocket },
  decor: { crater: smallCrater },
};
