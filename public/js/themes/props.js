// Đồ vật & trang trí dùng chung nhiều bối cảnh. p = { x, y, w, h, v } (toạ độ thế giới, v = số ngẫu nhiên 0..1).
import { hash, pickBy, rrect, circle, oval, poly, line, shadow, text, cuteFace } from './common.js';

const TAU = Math.PI * 2;
export const LEAF = ['#5fb45a', '#4fa34f', '#6cc070', '#7cc96b'];
export const BLOOM = ['#f472b6', '#facc15', '#f87171', '#a78bfa', '#ffffff'];
export const PAIRS = [
  ['#ef4444', '#ffffff'],
  ['#3b82f6', '#ffffff'],
  ['#f59e0b', '#fff7ed'],
  ['#10b981', '#ecfdf5'],
  ['#ec4899', '#fdf2f8'],
  ['#8b5cf6', '#f5f3ff'],
];

const centerX = (p) => p.x + p.w / 2;

export function tree(ctx, p) {
  const cx = centerX(p);
  const base = p.y + p.h - 10;
  const leaf = pickBy(p.v, LEAF);
  shadow(ctx, cx, base, p.w * 0.38, 12);
  rrect(ctx, cx - 9, base - p.h * 0.42, 18, p.h * 0.42, 5, '#9a6a45');
  circle(ctx, cx - p.w * 0.2, p.y + p.h * 0.42, p.w * 0.24, leaf);
  circle(ctx, cx + p.w * 0.2, p.y + p.h * 0.42, p.w * 0.24, leaf);
  circle(ctx, cx, p.y + p.h * 0.28, p.w * 0.3, leaf);
  if (p.v >= 0.5) treeFruits(ctx, p, cx);
  cuteFace(ctx, cx, p.y + p.h * 0.3, 1.2);
}

function treeFruits(ctx, p, cx) {
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    circle(ctx, cx + side * p.w * (0.15 + hash(i, p.v) * 0.2), p.y + p.h * (0.36 + hash(i + 9, p.v) * 0.14), 5, '#ef4444', false);
  }
}

export function bush(ctx, p) {
  const cx = centerX(p);
  const base = p.y + p.h - 12;
  const leaf = pickBy(p.v, LEAF);
  shadow(ctx, cx, base + 4, p.w * 0.42, 8);
  circle(ctx, cx - 14, base - 14, 16, leaf);
  circle(ctx, cx + 14, base - 14, 16, leaf);
  circle(ctx, cx, base - 26, 18, leaf);
  for (let i = 0; i < 4; i++) {
    circle(ctx, cx - 16 + hash(i, p.v) * 32, base - 36 + hash(i + 5, p.v) * 24, 3.5, pickBy(hash(i + 11, p.v), BLOOM), false);
  }
  cuteFace(ctx, cx, base - 20, 0.8);
}

export function bench(ctx, p) {
  const x0 = p.x + 8;
  const w = p.w - 16;
  const wood = pickBy(p.v, ['#c98a4b', '#b7794a', '#5b8bd9']);
  shadow(ctx, centerX(p), p.y + p.h - 10, w / 2, 8);
  for (const lx of [x0 + 10, x0 + w - 15]) rrect(ctx, lx, p.y + p.h * 0.5, 5, p.h * 0.38, 2, '#4b5563');
  rrect(ctx, x0, p.y + p.h * 0.18, w, 11, 4, wood);
  rrect(ctx, x0, p.y + p.h * 0.36, w, 11, 4, wood);
  rrect(ctx, x0 - 4, p.y + p.h * 0.55, w + 8, 12, 4, wood);
}

export function lamp(ctx, p) {
  const cx = centerX(p);
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 14, 5);
  rrect(ctx, cx - 3, p.y + 10, 6, base - p.y - 10, 2, '#4b5563');
  rrect(ctx, cx - 9, base - 8, 18, 8, 3, '#374151');
  circle(ctx, cx, p.y + 8, 10, '#fde68a');
}

export function flowerpot(ctx, p) {
  const cx = centerX(p);
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 18, 5);
  for (let i = 0; i < 3; i++) {
    const fx = cx - 12 + i * 12;
    const fy = base - 48 + hash(i, p.v) * 10;
    line(ctx, fx, base - 24, fx, fy, '#3f8f3f', 3);
    circle(ctx, fx, fy, 7, pickBy(hash(i + 3, p.v), BLOOM));
  }
  poly(ctx, [[cx - 18, base - 26], [cx + 18, base - 26], [cx + 13, base], [cx - 13, base]], '#d9774b');
}

export function planter(ctx, p) {
  const cx = centerX(p);
  const base = p.y + p.h - 6;
  shadow(ctx, cx, base, 20, 5);
  rrect(ctx, cx - 3, base - 46, 6, 26, 2, '#9a6a45');
  circle(ctx, cx, base - 52, 22, pickBy(p.v, LEAF));
  rrect(ctx, cx - 18, base - 24, 36, 24, 4, '#9ca3af');
}

export function foodcart(ctx, p) {
  const x = p.x + 10;
  const w = p.w - 20;
  const base = p.y + p.h - 6;
  const colors = pickBy(p.v, PAIRS);
  const label = pickBy(hash(1, p.v), ['Kem', 'Bánh mì', 'Trà sữa', 'Bắp rang', 'Kẹo bông']);
  shadow(ctx, centerX(p), base, w / 2, 7);
  line(ctx, x + 6, base - 36, x + 6, p.y + 14, '#6b7280', 3);
  line(ctx, x + w - 6, base - 36, x + w - 6, p.y + 14, '#6b7280', 3);
  for (let i = 0; i < 6; i++) rrect(ctx, x - 4 + ((w + 8) * i) / 6, p.y + 2, (w + 8) / 6, 14, 0, colors[i % 2], false);
  rrect(ctx, x - 4, p.y + 2, w + 8, 14, 3, 'transparent');
  rrect(ctx, x, base - 38, w, 30, 6, colors[0]);
  rrect(ctx, x + 12, base - 31, w - 24, 16, 4, '#fff', false);
  text(ctx, label, x + w / 2, base - 23, 12);
  circle(ctx, x + 16, base - 6, 7, '#374151');
  circle(ctx, x + w - 16, base - 6, 7, '#374151');
}

function drawPine(ctx, p, snow) {
  const cx = centerX(p);
  const base = p.y + p.h - 10;
  const green = pickBy(p.v, ['#2f855a', '#3a9d64', '#276749']);
  shadow(ctx, cx, base, p.w * 0.34, 10);
  rrect(ctx, cx - 7, base - 26, 14, 26, 3, '#7c4a2d');
  for (let i = 0; i < 3; i++) {
    const ty = p.y + 6 + i * p.h * 0.22;
    const half = p.w * (0.22 + i * 0.1);
    poly(ctx, [[cx, ty], [cx + half, ty + p.h * 0.34], [cx - half, ty + p.h * 0.34]], green);
    if (snow) poly(ctx, [[cx, ty], [cx + half * 0.45, ty + p.h * 0.15], [cx - half * 0.45, ty + p.h * 0.15]], '#ffffff', false);
  }
  cuteFace(ctx, cx, p.y + p.h * 0.72, 1);
}

export const pine = (ctx, p) => drawPine(ctx, p, false);
export const snowyPine = (ctx, p) => drawPine(ctx, p, true);

export function hay(ctx, p) {
  const cx = centerX(p);
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 26, 6);
  rrect(ctx, cx - 25, base - 36, 50, 36, 10, '#e9c46a');
  for (let i = 1; i < 4; i++) line(ctx, cx - 20, base - 36 + i * 9, cx + 20, base - 36 + i * 9, '#c9a227', 2);
  cuteFace(ctx, cx, base - 19, 0.8);
}

export function rock(ctx, p) {
  const cx = centerX(p);
  const base = p.y + p.h - 10;
  const pts = [];
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    const r = 20 + hash(i, p.v) * 8;
    pts.push([cx + Math.cos(a) * r * 1.2, base + Math.sin(a) * r]);
  }
  shadow(ctx, cx, base, 26, 6);
  poly(ctx, pts, pickBy(p.v, ['#9ca3af', '#a8a29e', '#94a3b8']));
  cuteFace(ctx, cx, base - 12, 0.75);
}

// Hàng rào gỗ nằm ngang từ x0 tới x1, chân ở y.
export function fenceRow(ctx, x0, x1, y, h = 30, color = '#c98a4b') {
  rrect(ctx, x0, y - h * 0.75, x1 - x0, 6, 2, color);
  rrect(ctx, x0, y - h * 0.4, x1 - x0, 6, 2, color);
  for (let x = x0; x <= x1 - 8; x += 20) rrect(ctx, x, y - h, 8, h, 2, color);
}

export function fence(ctx, p) {
  fenceRow(ctx, p.x + 4, p.x + p.w - 4, p.y + p.h - 10, 34);
}

export function signpost(ctx, p) {
  const cx = centerX(p);
  const base = p.y + p.h - 8;
  const label = pickBy(p.v, ['→', '←', '↑', '★']);
  shadow(ctx, cx, base, 14, 4);
  rrect(ctx, cx - 3, p.y + 18, 6, base - p.y - 18, 2, '#9a6a45');
  rrect(ctx, cx - 26, p.y + 6, 52, 24, 5, '#fde68a');
  text(ctx, label, cx, p.y + 18, 18);
}

// ---------- Trang trí nhỏ trên nền (không chiếm ô) ----------
export function tuft(ctx, d) {
  ctx.strokeStyle = '#6fae4f';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(d.x - d.s * 0.5, d.y - d.s);
  ctx.lineTo(d.x, d.y);
  ctx.lineTo(d.x, d.y - d.s * 1.3);
  ctx.moveTo(d.x, d.y);
  ctx.lineTo(d.x + d.s * 0.5, d.y - d.s);
  ctx.stroke();
}

export function flower(ctx, d) {
  ctx.fillStyle = d.color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    const px = d.x + Math.cos(a) * d.s * 0.4;
    const py = d.y + Math.sin(a) * d.s * 0.4;
    ctx.moveTo(px + d.s * 0.3, py);
    ctx.arc(px, py, d.s * 0.3, 0, TAU);
  }
  ctx.fill();
  circle(ctx, d.x, d.y, d.s * 0.22, '#f59e0b', false);
}

export function leaf(ctx, d) {
  oval(ctx, d.x, d.y, d.s * 0.6, d.s * 0.3, d.color, false, 0, d.rot);
}

export function pebble(ctx, d) {
  oval(ctx, d.x, d.y, d.s * 0.4, d.s * 0.28, d.color, false);
}

export function sparkle(ctx, d) {
  ctx.strokeStyle = d.color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = d.rot + (i / 3) * Math.PI;
    ctx.moveTo(d.x - Math.cos(a) * d.s * 0.5, d.y - Math.sin(a) * d.s * 0.5);
    ctx.lineTo(d.x + Math.cos(a) * d.s * 0.5, d.y + Math.sin(a) * d.s * 0.5);
  }
  ctx.stroke();
}

export function confetti(ctx, d) {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.rotate(d.rot);
  ctx.fillStyle = d.color;
  ctx.fillRect(-d.s * 0.4, -d.s * 0.15, d.s * 0.8, d.s * 0.3);
  ctx.restore();
}
