// 🦁 Sở thú: cổng "SỞ THÚ", hươu cao cổ ló đầu sau hàng cây; chuồng thú có hồ nước, đá, cây, biển chỉ đường, rơm.
import { hash, rrect, circle, oval, line, text, fillArea, vgrad, cloud } from './common.js';
import { scatterProps } from './layout.js';
import { tree, bush, bench, foodcart, hay, rock, signpost, fenceRow, tuft, flower } from './props.js';

const SPECS = [
  { type: 'pen', w: 3, h: 2, weight: 3 },
  { type: 'tree', w: 2, h: 2, weight: 4 },
  { type: 'bush', w: 1, h: 1, weight: 4 },
  { type: 'rock', w: 1, h: 1, weight: 3 },
  { type: 'hay', w: 1, h: 1, weight: 2 },
  { type: 'signpost', w: 1, h: 1, weight: 2 },
  { type: 'bench', w: 2, h: 1, weight: 2 },
  { type: 'foodcart', w: 2, h: 1, weight: 1 },
];

function giraffe(ctx, x, top) {
  const neckTop = top * 0.22;
  rrect(ctx, x - 10, neckTop, 20, top - neckTop, 8, '#facc15');
  for (let i = 0; i < 5; i++) circle(ctx, x - 3 + (i % 2) * 6, neckTop + 22 + i * 22, 5, '#b45309', false);
  oval(ctx, x + 14, neckTop, 26, 14, '#facc15');
  line(ctx, x + 4, neckTop - 12, x + 2, neckTop - 24, '#b45309', 3);
  line(ctx, x + 14, neckTop - 12, x + 16, neckTop - 24, '#b45309', 3);
  circle(ctx, x + 18, neckTop - 3, 2.5, '#111', false);
}

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#a5e3ff', '#e6f7ff']);
  ctx.fillRect(0, 0, w, top);
  for (let i = 0; i * 420 < w; i++) cloud(ctx, i * 420 + 80, top * (0.15 + hash(i, 1) * 0.15), 0.9);
  for (let x = 180; x < w; x += 520) giraffe(ctx, x + hash(x, 2) * 120, top);
  for (let x = 0; x < w; x += 50) circle(ctx, x, top - 18 - hash(x, 3) * 18, 28, '#5fa851', false);
  fenceRow(ctx, 0, w, top, 34, '#a16207');
  const cx = w / 2;
  rrect(ctx, cx - 190, top * 0.2, 30, top * 0.8, 4, '#a16207');
  rrect(ctx, cx + 160, top * 0.2, 30, top * 0.8, 4, '#a16207');
  rrect(ctx, cx - 210, top * 0.12, 420, 54, 14, '#16a34a');
  text(ctx, '🦁 SỞ THÚ BUBU & DUDU 🦒', cx, top * 0.12 + 28, 26, '#fff');
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#b5dc8f');
}

function pen(ctx, p) {
  const x = p.x + 8;
  const y = p.y + 14;
  const w = p.w - 16;
  const h = p.h - 22;
  rrect(ctx, x, y, w, h, 10, '#d9c08a');
  oval(ctx, x + w * 0.66, y + h * 0.55, w * 0.2, h * 0.24, '#7cc4f0');
  circle(ctx, x + w * 0.25, y + h * 0.6, 14, '#9ca3af');
  circle(ctx, x + w * 0.35, y + h * 0.68, 10, '#a8a29e');
  line(ctx, x + w * 0.15, y + h * 0.3, x + w * 0.2, y + h * 0.5, '#4fa34f', 3);
  fenceRow(ctx, x - 4, x + w + 4, y + 16, 24, '#a16207');
  fenceRow(ctx, x - 4, x + w + 4, y + h + 4, 24, '#a16207');
}

export default {
  key: 'zoo',
  name: 'Sở thú',
  icon: '🦁',
  topBand: 3,
  propShare: 0.3,
  decorDensity: 0.8,
  decorTypes: ['tuft', 'tuft', 'flower'],
  decorColors: ['#ffffff', '#fde047', '#f9a8d4'],
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { pen, tree, bush, rock, hay, signpost, bench, foodcart },
  decor: { tuft, flower },
};

