// 🎡 Khu vui chơi: vòng quay, lều xiếc, cờ dây phía trên; ngựa gỗ, quầy vé, bóng bay, xe kem, bắp rang.
import { hash, pickBy, rrect, circle, oval, poly, line, shadow, text, fillArea, vgrad, stripedFan, bunting } from './common.js';
import { scatterProps } from './layout.js';
import { foodcart, lamp, confetti, PAIRS } from './props.js';

const TAU = Math.PI * 2;
const PARTY = ['#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const SPECS = [
  { type: 'balloons', w: 1, h: 1, weight: 4 },
  { type: 'popcorn', w: 1, h: 1, weight: 3 },
  { type: 'foodcart', w: 2, h: 1, weight: 3 },
  { type: 'lamp', w: 1, h: 1, weight: 2 },
  { type: 'booth', w: 2, h: 2, weight: 1, max: 2 },
  { type: 'carousel', w: 3, h: 3, weight: 1, max: 1 },
];

function ferrisWheel(ctx, cx, cy, r) {
  line(ctx, cx, cy, cx - r * 0.6, cy + r * 1.15, '#64748b', 8);
  line(ctx, cx, cy, cx + r * 0.6, cy + r * 1.15, '#64748b', 8);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    line(ctx, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, '#cbd5e1', 3);
  }
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    rrect(ctx, cx + Math.cos(a) * r - 10, cy + Math.sin(a) * r - 4, 20, 18, 5, PARTY[i % PARTY.length]);
  }
  circle(ctx, cx, cy, 10, '#facc15');
}

function tent(ctx, x, w, top, i) {
  const h = top * 0.42;
  const colors = pickBy(hash(i, 7), PAIRS);
  rrect(ctx, x, top - h * 0.55, w, h * 0.55, 0, colors[1]);
  stripedFan(ctx, [x + w / 2, top - h], x - 8, x + w + 8, top - h * 0.5, colors, 8);
  poly(ctx, [[x + w / 2 - 18, top], [x + w / 2 + 18, top], [x + w / 2, top - h * 0.4]], '#3b2a22', false);
  line(ctx, x + w / 2, top - h, x + w / 2, top - h - 22, '#3b2a22', 2);
  poly(ctx, [[x + w / 2, top - h - 22], [x + w / 2 + 16, top - h - 17], [x + w / 2, top - h - 12]], colors[0], false);
}

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#ffd6e8', '#fff2d6']);
  ctx.fillRect(0, 0, w, top);
  for (let x = 160; x < w; x += 1100) ferrisWheel(ctx, x, top * 0.42, top * 0.34);
  for (let x = 420, i = 0; x < w - 160; x += 360, i++) tent(ctx, x, 150, top, i);
  bunting(ctx, 0, w, 18, PARTY);
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#fde9c9');
}

function carousel(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 22;
  const roofY = p.y + p.h * 0.36;
  const rx = p.w * 0.46;
  shadow(ctx, cx, base + 10, rx, 22);
  oval(ctx, cx, base, rx, 22, '#f9a8d4');
  for (let i = 0; i < 5; i++) {
    const x = cx - rx * 0.8 + i * ((rx * 1.6) / 4);
    line(ctx, x, base, x, roofY, '#facc15', 4);
    rrect(ctx, x - 12, roofY + (base - roofY) * (0.4 + (i % 2) * 0.15), 24, 16, 6, PARTY[i]);
  }
  stripedFan(ctx, [cx, p.y + 8], cx - rx, cx + rx, roofY, ['#ef4444', '#ffffff'], 10);
  for (let i = 0; i <= 10; i++) circle(ctx, cx - rx + (2 * rx * i) / 10, roofY + 4, 6, PARTY[i % PARTY.length], true, 1.5);
}

function booth(ctx, p) {
  const x = p.x + 10;
  const w = p.w - 20;
  const base = p.y + p.h - 10;
  shadow(ctx, p.x + p.w / 2, base, w / 2, 8);
  rrect(ctx, x, p.y + p.h * 0.38, w, base - p.y - p.h * 0.38, 6, '#fde68a');
  rrect(ctx, x + w * 0.2, p.y + p.h * 0.48, w * 0.6, p.h * 0.22, 6, '#1e3a8a');
  text(ctx, 'VÉ', x + w / 2, p.y + p.h * 0.59, 22, '#fff');
  stripedFan(ctx, [x + w / 2, p.y + 6], x - 8, x + w + 8, p.y + p.h * 0.4, pickBy(p.v, PAIRS), 6);
}

function balloons(ctx, p) {
  const cx = p.x + p.w / 2;
  const hand = p.y + p.h - 16;
  shadow(ctx, cx, p.y + p.h - 6, 12, 4);
  for (let i = 0; i < 4; i++) {
    const bx = cx - 18 + i * 12;
    const by = p.y + 10 + hash(i, p.v) * 16;
    line(ctx, cx, hand, bx, by + 10, '#6b7280', 1);
    circle(ctx, bx, by, 10, pickBy(hash(i + 4, p.v), PARTY), true, 1.5);
  }
  rrect(ctx, cx - 4, hand - 2, 8, 12, 3, '#6b7280');
}

function popcorn(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 10;
  shadow(ctx, cx, base, 18, 5);
  for (let i = 0; i < 6; i++) circle(ctx, cx - 14 + (i % 3) * 14, base - 44 - Math.floor(i / 3) * 8, 9, '#fef3c7', true, 1.5);
  const box = [[cx - 20, base - 40], [cx + 20, base - 40], [cx + 14, base], [cx - 14, base]];
  poly(ctx, box, '#ffffff');
  for (let i = 0; i < 3; i++) {
    const x0 = cx - 15 + i * 12;
    poly(ctx, [[x0, base - 40], [x0 + 6, base - 40], [x0 + 5, base], [x0 + 1, base]], '#ef4444', false);
  }
}

export default {
  key: 'fun',
  name: 'Khu vui chơi',
  icon: '🎡',
  topBand: 4,
  propShare: 0.28,
  decorDensity: 0.6,
  decorTypes: ['confetti'],
  decorColors: PARTY,
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { carousel, booth, balloons, popcorn, foodcart, lamp },
  decor: { confetti },
};
