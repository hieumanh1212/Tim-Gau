// 🏖️ Bãi biển: biển & sóng phía trên, bãi cát, ô dù, khăn tắm, lâu đài cát, cây dừa, bóng.
import { hash, pickBy, rrect, circle, oval, poly, line, shadow, fillArea, vgrad, sun, stripedFan, cuteFace } from './common.js';
import { scatterProps } from './layout.js';
import { PAIRS } from './props.js';

const TAU = Math.PI * 2;
const SPECS = [
  { type: 'umbrella', w: 2, h: 2, weight: 4 },
  { type: 'towel', w: 2, h: 1, weight: 4 },
  { type: 'castle', w: 1, h: 1, weight: 3 },
  { type: 'palm', w: 2, h: 2, weight: 2 },
  { type: 'ball', w: 1, h: 1, weight: 2 },
];

function waves(ctx, w, y0, y1) {
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  for (let y = y0 + 20, row = 0; y < y1 - 10; y += 26, row++) {
    ctx.beginPath();
    for (let x = (row % 2) * 40; x < w; x += 80) {
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 15, y - 8, x + 30, y);
    }
    ctx.stroke();
  }
}

function band(ctx, scene) {
  const { width: w, top } = scene;
  const sea = top * 0.28;
  ctx.fillStyle = vgrad(ctx, 0, sea, ['#a5e3ff', '#d9f4ff']);
  ctx.fillRect(0, 0, w, sea);
  sun(ctx, w * 0.12, sea * 0.5, sea * 0.32);
  ctx.fillStyle = vgrad(ctx, sea, top, ['#1d9bd6', '#5cc8ee', '#9fe2f6']);
  ctx.fillRect(0, sea, w, top - sea);
  waves(ctx, w, sea, top);
  for (let x = 300; x < w; x += 900) boat(ctx, x + hash(x, 1) * 300, sea + 30);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, top);
  for (let x = 0; x <= w; x += 40) ctx.quadraticCurveTo(x + 20, top - 16, x + 40, top);
  ctx.fill();
}

function boat(ctx, x, y) {
  poly(ctx, [[x - 30, y], [x + 30, y], [x + 20, y + 14], [x - 20, y + 14]], '#ef4444');
  line(ctx, x, y, x, y - 40, '#3b2a22', 2);
  poly(ctx, [[x + 2, y - 40], [x + 2, y - 4], [x + 28, y - 4]], '#fff');
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#f6e3b4');
}

function umbrella(ctx, p) {
  const cx = p.x + p.w / 2;
  const top = p.y + p.h * 0.3;
  const base = p.y + p.h - 12;
  shadow(ctx, cx + 12, base, p.w * 0.4, 14);
  rrect(ctx, cx - 3, top, 6, base - top, 2, '#f8fafc');
  stripedFan(ctx, [cx, top - p.h * 0.22], cx - p.w * 0.48, cx + p.w * 0.48, top + 10, pickBy(p.v, PAIRS), 6);
  circle(ctx, cx, top - p.h * 0.22, 5, '#fde047');
}

function towel(ctx, p) {
  const x = p.x + 6;
  const y = p.y + 18;
  const w = p.w - 12;
  const h = p.h - 32;
  const colors = pickBy(p.v, PAIRS);
  for (let i = 0; i < 6; i++) rrect(ctx, x + (w * i) / 6, y, w / 6, h, 0, colors[i % 2], false);
  rrect(ctx, x, y, w, h, 6, 'transparent');
}

function castle(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  const sand = '#e2bf72';
  shadow(ctx, cx, base, 24, 6);
  rrect(ctx, cx - 22, base - 26, 44, 26, 2, sand);
  rrect(ctx, cx - 26, base - 42, 14, 40, 2, sand);
  rrect(ctx, cx + 12, base - 42, 14, 40, 2, sand);
  rrect(ctx, cx - 8, base - 50, 16, 26, 2, sand);
  line(ctx, cx, base - 50, cx, base - 66, '#3b2a22', 2);
  poly(ctx, [[cx, base - 66], [cx + 14, base - 61], [cx, base - 56]], '#ef4444', false);
  rrect(ctx, cx - 6, base - 14, 12, 14, 6, '#c9a35a', false);
  cuteFace(ctx, cx, base - 36, 0.5);
}

function palm(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 10;
  const topY = p.y + p.h * 0.22;
  shadow(ctx, cx, base, 40, 10);
  ctx.strokeStyle = '#a0703f';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, base);
  ctx.quadraticCurveTo(cx + 26, (base + topY) / 2, cx + 6, topY);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.3;
    oval(ctx, cx + 6 + Math.cos(a) * 30, topY + Math.sin(a) * 14, 34, 10, '#3fa34d', true, 2, a);
  }
  for (const dx of [-6, 8]) circle(ctx, cx + dx + 6, topY + 10, 7, '#8b5a3c');
}

function ball(ctx, p) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h - 26;
  const r = 18;
  shadow(ctx, cx, cy + r, r, 5);
  circle(ctx, cx, cy, r, '#ffffff', false);
  const colors = ['#ef4444', '#3b82f6', '#facc15'];
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, (i / 3) * TAU + p.v, (i / 3) * TAU + p.v + TAU / 6);
    ctx.fillStyle = colors[i];
    ctx.fill();
  }
  circle(ctx, cx, cy, r, 'transparent');
}

function shell(ctx, d) {
  stripedFan(ctx, [d.x, d.y + d.s * 0.5], d.x - d.s * 0.6, d.x + d.s * 0.6, d.y - d.s * 0.4, [d.color, '#fff7ed'], 4);
}

function starfish(ctx, d) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = d.rot + (i / 10) * TAU;
    const r = i % 2 ? d.s * 0.3 : d.s * 0.75;
    pts.push([d.x + Math.cos(a) * r, d.y + Math.sin(a) * r]);
  }
  poly(ctx, pts, '#fb923c', true, 1);
}

export default {
  key: 'beach',
  name: 'Bãi biển',
  icon: '🏖️',
  topBand: 3,
  propShare: 0.28,
  decorDensity: 0.5,
  decorTypes: ['shell', 'starfish', 'shell'],
  decorColors: ['#fda4af', '#fdba74', '#f9a8d4', '#fde68a'],
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { umbrella, towel, castle, palm, ball },
  decor: { shell, starfish },
};
