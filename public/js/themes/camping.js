// 🏕️ Cắm trại: hoàng hôn trên núi & hồ; lều, lửa trại, khúc gỗ, cây thông, ba lô, nấm.
import { hash, pickBy, rrect, circle, oval, poly, line, shadow, fillArea, vgrad, cuteFace } from './common.js';
import { scatterProps } from './layout.js';
import { pine, rock, tuft, pebble, PAIRS } from './props.js';

const SPECS = [
  { type: 'tent', w: 2, h: 2, weight: 4 },
  { type: 'pine', w: 2, h: 2, weight: 5 },
  { type: 'campfire', w: 1, h: 1, weight: 3 },
  { type: 'log', w: 2, h: 1, weight: 3 },
  { type: 'backpack', w: 1, h: 1, weight: 2 },
  { type: 'mushroom', w: 1, h: 1, weight: 3 },
  { type: 'rock', w: 1, h: 1, weight: 2 },
];

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#fb923c', '#fdba74', '#fde68a']);
  ctx.fillRect(0, 0, w, top);
  circle(ctx, w * 0.5, top * 0.62, top * 0.2, '#fef3c7', false);
  for (let x = -200, i = 0; x < w + 200; x += 340, i++) {
    poly(ctx, [[x, top * 0.85], [x + 200, top * (0.2 + hash(i, 1) * 0.2)], [x + 400, top * 0.85]], '#7c3aed', false);
  }
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(0, top * 0.8, w, top * 0.2);
  for (let x = 0; x < w; x += 36) poly(ctx, [[x - 18, top], [x, top - 40 - hash(x, 2) * 30], [x + 18, top]], '#14532d', false);
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#9bc27a');
}

function tent(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 12;
  const topY = p.y + p.h * 0.25;
  const [color] = pickBy(p.v, PAIRS);
  shadow(ctx, cx, base, p.w * 0.46, 10);
  line(ctx, cx, topY, p.x + 4, base + 4, '#6b7280', 1.5);
  line(ctx, cx, topY, p.x + p.w - 4, base + 4, '#6b7280', 1.5);
  poly(ctx, [[cx, topY], [cx + p.w * 0.4, base], [cx - p.w * 0.4, base]], color);
  poly(ctx, [[cx, topY + 20], [cx + 18, base], [cx - 18, base]], '#3b2a22', false);
  line(ctx, cx, topY, cx, topY - 14, '#3b2a22', 2);
}

function campfire(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 12;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    circle(ctx, cx + Math.cos(a) * 22, base + 6 + Math.sin(a) * 6, 6, '#9ca3af', true, 1.5);
  }
  line(ctx, cx - 16, base, cx + 16, base - 10, '#7c4a2d', 7);
  line(ctx, cx + 16, base, cx - 16, base - 10, '#7c4a2d', 7);
  poly(ctx, [[cx - 14, base - 6], [cx, base - 46], [cx + 14, base - 6]], '#f97316', false);
  poly(ctx, [[cx - 8, base - 6], [cx + 2, base - 30], [cx + 8, base - 6]], '#fde047', false);
}

function log(ctx, p) {
  const x = p.x + 10;
  const w = p.w - 20;
  const y = p.y + p.h - 34;
  shadow(ctx, p.x + p.w / 2, p.y + p.h - 8, w / 2, 6);
  rrect(ctx, x, y, w, 24, 10, '#92400e');
  line(ctx, x + 14, y + 8, x + w * 0.5, y + 8, '#78350f', 2);
  oval(ctx, x + w - 4, y + 12, 9, 12, '#d6a76a');
  oval(ctx, x + w - 4, y + 12, 4, 6, '#b7794a', false);
}

function backpack(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  const [color] = pickBy(p.v, PAIRS);
  shadow(ctx, cx, base, 18, 4);
  rrect(ctx, cx - 16, base - 44, 32, 44, 10, color);
  rrect(ctx, cx - 11, base - 20, 22, 14, 4, 'rgba(255,255,255,0.5)');
  rrect(ctx, cx - 16, base - 44, 32, 12, 8, color);
}

function mushroom(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 16, 4);
  rrect(ctx, cx - 7, base - 26, 14, 26, 5, '#fef3c7');
  oval(ctx, cx, base - 28, 22, 13, pickBy(p.v, ['#ef4444', '#f97316', '#a855f7']));
  for (let i = 0; i < 3; i++) circle(ctx, cx - 10 + i * 10, base - 32 + (i % 2) * 5, 3, '#fff', false);
  cuteFace(ctx, cx, base - 12, 0.45);
}

export default {
  key: 'camping',
  name: 'Cắm trại',
  icon: '🏕️',
  topBand: 3,
  propShare: 0.3,
  decorDensity: 0.7,
  decorTypes: ['tuft', 'pebble'],
  decorColors: ['#a8a29e', '#78716c'],
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { tent, pine, campfire, log, backpack, mushroom, rock },
  decor: { tuft, pebble },
};
