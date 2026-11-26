// 🏫 Trường học: toà nhà trường có đồng hồ & biển tên, sân trường, bàn học, bảng đen, cầu trượt, xích đu, sách, quả địa cầu.
import { hash, pickBy, rrect, circle, oval, line, shadow, text, fillArea, vgrad } from './common.js';
import { scatterProps } from './layout.js';
import { tree, bench, sparkle, PAIRS } from './props.js';

const BOOKS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];
const SPECS = [
  { type: 'desk', w: 2, h: 1, weight: 5 },
  { type: 'board', w: 2, h: 1, weight: 2 },
  { type: 'slide', w: 2, h: 2, weight: 2 },
  { type: 'swing', w: 2, h: 2, weight: 2 },
  { type: 'books', w: 1, h: 1, weight: 3 },
  { type: 'globe', w: 1, h: 1, weight: 2 },
  { type: 'tree', w: 2, h: 2, weight: 2 },
  { type: 'bench', w: 2, h: 1, weight: 1 },
];

function schoolWindow(ctx, x, y) {
  rrect(ctx, x, y, 60, 46, 4, '#dbeafe');
  line(ctx, x + 30, y + 2, x + 30, y + 44, '#93c5fd', 2);
  line(ctx, x + 2, y + 23, x + 58, y + 23, '#93c5fd', 2);
}

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#bae6fd', '#e0f2fe']);
  ctx.fillRect(0, 0, w, top);
  rrect(ctx, -4, top * 0.22, w + 8, top * 0.78 + 4, 0, '#fef3c7');
  rrect(ctx, -4, top * 0.18, w + 8, 16, 0, '#ef4444');
  for (let x = 30; x < w - 60; x += 110) schoolWindow(ctx, x, top * 0.42);
  const cx = w / 2;
  rrect(ctx, cx - 200, top * 0.24, 400, 40, 10, '#2563eb');
  text(ctx, 'TRƯỜNG MẦM NON GẤU CON', cx, top * 0.24 + 21, 22, '#fff');
  circle(ctx, cx, top * 0.1, 22, '#fff');
  line(ctx, cx, top * 0.1, cx, top * 0.1 - 14, '#3b2a22', 3);
  line(ctx, cx, top * 0.1, cx + 10, top * 0.1, '#3b2a22', 3);
  rrect(ctx, cx - 40, top - 70, 80, 70, 6, '#b45309');
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#ebe5d8');
}

function desk(ctx, p) {
  const x = p.x + 12;
  const w = p.w - 24;
  const topY = p.y + p.h * 0.32;
  shadow(ctx, p.x + p.w / 2, p.y + p.h - 8, w / 2, 6);
  for (const lx of [x + 6, x + w - 10]) rrect(ctx, lx, topY, 5, p.h * 0.58, 2, '#6b7280');
  rrect(ctx, x, topY, w, 12, 3, '#d4a373');
  rrect(ctx, x + w * 0.15, topY - 8, 26, 8, 2, pickBy(p.v, BOOKS));
  line(ctx, x + w * 0.6, topY - 3, x + w * 0.8, topY - 6, '#f59e0b', 3);
}

function board(ctx, p) {
  const x = p.x + 10;
  const w = p.w - 20;
  const base = p.y + p.h - 6;
  shadow(ctx, p.x + p.w / 2, base, w / 2, 6);
  line(ctx, x + 12, base, x + 18, p.y + 20, '#9a6a45', 4);
  line(ctx, x + w - 12, base, x + w - 18, p.y + 20, '#9a6a45', 4);
  rrect(ctx, x, p.y + 6, w, p.h * 0.6, 4, '#c98a4b');
  rrect(ctx, x + 5, p.y + 11, w - 10, p.h * 0.6 - 10, 2, '#1f5135', false);
  text(ctx, pickBy(p.v, ['A B C', '1+1=2', '♥ Gấu', 'Xin chào']), p.x + p.w / 2, p.y + 6 + p.h * 0.3, 15, '#f8fafc');
}

function slide(ctx, p) {
  const x = p.x + 14;
  const base = p.y + p.h - 10;
  const topY = p.y + p.h * 0.3;
  const color = pickBy(p.v, ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e']);
  shadow(ctx, p.x + p.w / 2, base, p.w * 0.45, 10);
  line(ctx, x, base, x + 8, topY, '#64748b', 4);
  line(ctx, x + 24, base, x + 32, topY, '#64748b', 4);
  for (let i = 1; i < 5; i++) line(ctx, x + 1.6 * i, base - (i * (base - topY)) / 5, x + 24 + 1.6 * i, base - (i * (base - topY)) / 5, '#64748b', 3);
  rrect(ctx, x + 2, topY - 8, 40, 10, 3, color);
  ctx.strokeStyle = color;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 40, topY);
  ctx.quadraticCurveTo(x + 66, topY + 30, p.x + p.w - 16, base - 8);
  ctx.stroke();
}

function swing(ctx, p) {
  const x0 = p.x + 10;
  const x1 = p.x + p.w - 10;
  const topY = p.y + 16;
  const base = p.y + p.h - 8;
  shadow(ctx, p.x + p.w / 2, base, p.w * 0.45, 8);
  for (const x of [x0, x1]) {
    line(ctx, x, topY, x - 10, base, '#2563eb', 5);
    line(ctx, x, topY, x + 10, base, '#2563eb', 5);
  }
  line(ctx, x0, topY, x1, topY, '#1d4ed8', 6);
  for (const sx of [x0 + 26, x1 - 46]) {
    line(ctx, sx, topY, sx, base - 34, '#6b7280', 2);
    line(ctx, sx + 20, topY, sx + 20, base - 34, '#6b7280', 2);
    rrect(ctx, sx - 3, base - 36, 26, 7, 2, '#f59e0b');
  }
}

function books(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 22, 5);
  for (let i = 0; i < 4; i++) {
    const w = 38 - hash(i, p.v) * 10;
    rrect(ctx, cx - w / 2 + (hash(i + 3, p.v) - 0.5) * 8, base - 11 * (i + 1), w, 10, 2, pickBy(hash(i + 7, p.v), BOOKS));
  }
}

function globe(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 16, 4);
  rrect(ctx, cx - 14, base - 8, 28, 8, 3, '#9a6a45');
  line(ctx, cx, base - 8, cx, base - 18, '#9a6a45', 4);
  circle(ctx, cx, base - 40, 22, '#60a5fa');
  oval(ctx, cx - 7, base - 46, 9, 6, '#4ade80', false);
  oval(ctx, cx + 8, base - 32, 7, 5, '#4ade80', false);
}

function chalk(ctx, d) {
  sparkle(ctx, d);
}

export default {
  key: 'school',
  name: 'Trường học',
  icon: '🏫',
  topBand: 3,
  propShare: 0.28,
  decorDensity: 0.3,
  decorTypes: ['chalk'],
  decorColors: PAIRS.map((pair) => pair[0]),
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { desk, board, slide, swing, books, globe, tree, bench },
  decor: { chalk },
};

