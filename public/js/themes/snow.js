// ❄️ Xứ tuyết: núi tuyết, tuyết rơi; thông phủ tuyết, người tuyết, lều tuyết, xe trượt, hộp quà. Nền trắng => khó tìm Bubu hơn!
import { hash, pickBy, rrect, circle, poly, line, shadow, fillArea, vgrad } from './common.js';
import { scatterProps } from './layout.js';
import { snowyPine, sparkle, PAIRS } from './props.js';

const SPECS = [
  { type: 'pine', w: 2, h: 2, weight: 5 },
  { type: 'snowman', w: 1, h: 1, weight: 4 },
  { type: 'igloo', w: 2, h: 2, weight: 1 },
  { type: 'sled', w: 2, h: 1, weight: 2 },
  { type: 'gift', w: 1, h: 1, weight: 3 },
];

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#93c5fd', '#dbeafe']);
  ctx.fillRect(0, 0, w, top);
  for (let x = -200, i = 0; x < w + 200; x += 300, i++) {
    const peak = top * (0.1 + hash(i, 1) * 0.25);
    poly(ctx, [[x, top], [x + 220, peak], [x + 440, top]], '#94a3b8', false);
    poly(ctx, [[x + 165, peak + (top - peak) * 0.25], [x + 220, peak], [x + 275, peak + (top - peak) * 0.25]], '#ffffff', false);
  }
  for (let x = 0; x < w; x += 40) poly(ctx, [[x - 16, top], [x, top - 34 - hash(x, 2) * 24], [x + 16, top]], '#1e5f46', false);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < w / 6; i++) {
    ctx.beginPath();
    ctx.arc(hash(i, 3) * w, hash(i, 4) * top, 2 + hash(i, 5) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#f5f9fc');
}

function snowman(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 6;
  shadow(ctx, cx, base, 18, 4);
  circle(ctx, cx, base - 16, 16, '#fff');
  circle(ctx, cx, base - 40, 12, '#fff');
  circle(ctx, cx, base - 59, 9, '#fff');
  rrect(ctx, cx - 10, base - 52, 20, 5, 2, pickBy(p.v, ['#ef4444', '#3b82f6', '#22c55e']), false);
  rrect(ctx, cx - 8, base - 78, 16, 12, 2, '#1f2937');
  rrect(ctx, cx - 12, base - 68, 24, 4, 2, '#1f2937');
  poly(ctx, [[cx, base - 60], [cx + 11, base - 58], [cx, base - 56]], '#f97316', false);
  circle(ctx, cx - 3, base - 62, 1.5, '#111', false);
  circle(ctx, cx + 4, base - 62, 1.5, '#111', false);
}

function igloo(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 12;
  const r = p.w * 0.42;
  shadow(ctx, cx, base, r + 6, 10);
  ctx.beginPath();
  ctx.arc(cx, base, r, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = '#e0f2fe';
  ctx.fill();
  ctx.strokeStyle = '#3b2a22';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let i = 1; i < 4; i++) line(ctx, cx - r * Math.sqrt(1 - (i / 4) ** 2), base - (r * i) / 4, cx + r * Math.sqrt(1 - (i / 4) ** 2), base - (r * i) / 4, '#93c5fd', 2);
  ctx.beginPath();
  ctx.arc(cx, base, r * 0.32, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#1e3a8a';
  ctx.fill();
}

function sled(ctx, p) {
  const x = p.x + 14;
  const w = p.w - 28;
  const base = p.y + p.h - 12;
  shadow(ctx, p.x + p.w / 2, base + 2, w / 2, 5);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x + w, base);
  ctx.quadraticCurveTo(x + w + 14, base, x + w + 10, base - 14);
  ctx.stroke();
  for (const lx of [x + 14, x + w - 18]) line(ctx, lx, base, lx, base - 14, '#475569', 3);
  rrect(ctx, x, base - 24, w, 12, 4, pickBy(p.v, ['#ef4444', '#2563eb', '#16a34a']));
}

function gift(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  const [color, ribbon] = pickBy(p.v, PAIRS);
  shadow(ctx, cx, base, 20, 4);
  rrect(ctx, cx - 18, base - 32, 36, 32, 3, color);
  rrect(ctx, cx - 4, base - 32, 8, 32, 0, ribbon, false);
  circle(ctx, cx - 7, base - 36, 6, ribbon);
  circle(ctx, cx + 7, base - 36, 6, ribbon);
}

export default {
  key: 'snow',
  name: 'Xứ tuyết',
  icon: '❄️',
  topBand: 3,
  propShare: 0.28,
  decorDensity: 0.4,
  decorTypes: ['sparkle'],
  decorColors: ['#93c5fd', '#bfdbfe'],
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { pine: snowyPine, snowman, igloo, sled, gift },
  decor: { sparkle },
};
