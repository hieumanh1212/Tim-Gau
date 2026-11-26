// 🌾 Nông trại: chuồng đỏ, tháp chứa, cối xay gió; ruộng rau, rơm, hàng rào, máy cày, bù nhìn, bí ngô.
import { hash, pickBy, rrect, circle, oval, poly, line, shadow, fillArea, vgrad, sun, cuteFace } from './common.js';
import { scatterProps } from './layout.js';
import { tree, hay, fence, fenceRow, tuft, flower } from './props.js';

const SPECS = [
  { type: 'field', w: 3, h: 2, weight: 3 },
  { type: 'hay', w: 1, h: 1, weight: 4 },
  { type: 'fence', w: 2, h: 1, weight: 3 },
  { type: 'pumpkin', w: 1, h: 1, weight: 3 },
  { type: 'scarecrow', w: 1, h: 1, weight: 2 },
  { type: 'tractor', w: 2, h: 1, weight: 1 },
  { type: 'tree', w: 2, h: 2, weight: 2 },
];

function barn(ctx, x, top) {
  const y = top * 0.3;
  poly(ctx, [[x - 10, y + 10], [x + 100, y - 50], [x + 210, y + 10]], '#991b1b');
  rrect(ctx, x, y + 10, 200, top - y - 10, 0, '#dc2626');
  rrect(ctx, x + 70, top - 90, 60, 90, 2, '#fff');
  line(ctx, x + 72, top - 88, x + 128, top - 2, '#dc2626', 5);
  line(ctx, x + 128, top - 88, x + 72, top - 2, '#dc2626', 5);
}

function silo(ctx, x, top) {
  rrect(ctx, x, top * 0.25, 60, top * 0.75, 0, '#cbd5e1');
  circle(ctx, x + 30, top * 0.25, 30, '#94a3b8');
}

function windmill(ctx, x, top) {
  poly(ctx, [[x - 18, top], [x + 18, top], [x + 8, top * 0.35], [x - 8, top * 0.35]], '#f5f5f4');
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    line(ctx, x, top * 0.35, x + Math.cos(a) * 60, top * 0.35 + Math.sin(a) * 60, '#78716c', 8);
  }
  circle(ctx, x, top * 0.35, 6, '#57534e');
}

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#93d3ff', '#e8f7ff']);
  ctx.fillRect(0, 0, w, top);
  sun(ctx, w - 100, top * 0.25, 28);
  for (let x = -100; x < w + 200; x += 300) oval(ctx, x + hash(x, 4) * 80, top, 200, top * 0.45, '#9bd17a', false);
  for (let x = 60, i = 0; x < w - 220; x += 700, i++) {
    barn(ctx, x, top);
    silo(ctx, x + 220, top);
    windmill(ctx, x + 420 + hash(i, 5) * 60, top);
  }
  fenceRow(ctx, 0, w, top, 30, '#f5f5f4');
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#bfe08f');
}

const CROPS = [
  (ctx, x, y) => {
    line(ctx, x, y + 6, x - 4, y - 4, '#16a34a', 3);
    line(ctx, x, y + 6, x + 4, y - 4, '#16a34a', 3);
  },
  (ctx, x, y) => {
    poly(ctx, [[x - 4, y], [x + 4, y], [x, y + 10]], '#f97316', false);
    line(ctx, x, y, x, y - 8, '#16a34a', 3);
  },
  (ctx, x, y) => circle(ctx, x, y + 2, 6, '#86efac', true, 1),
];

function field(ctx, p) {
  const x = p.x + 6;
  const y = p.y + 10;
  const w = p.w - 12;
  const h = p.h - 18;
  const crop = pickBy(p.v, CROPS);
  rrect(ctx, x, y, w, h, 8, '#9a6a45');
  for (let r = 0; r < 4; r++) {
    const ry = y + 16 + (r * (h - 28)) / 3;
    line(ctx, x + 6, ry + 8, x + w - 6, ry + 8, '#7c4a2d', 3);
    for (let cx = x + 14; cx < x + w - 8; cx += 18) crop(ctx, cx, ry);
  }
}

function pumpkin(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 10;
  shadow(ctx, cx, base + 2, 22, 5);
  oval(ctx, cx - 9, base - 14, 12, 14, '#f97316');
  oval(ctx, cx + 9, base - 14, 12, 14, '#f97316');
  oval(ctx, cx, base - 14, 12, 15, '#fb923c');
  rrect(ctx, cx - 2, base - 34, 5, 8, 2, '#15803d');
  cuteFace(ctx, cx, base - 15, 0.7);
}

function scarecrow(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 6;
  shadow(ctx, cx, base, 14, 4);
  line(ctx, cx, base, cx, p.y + 22, '#9a6a45', 5);
  line(ctx, cx - 26, p.y + 36, cx + 26, p.y + 36, '#9a6a45', 4);
  rrect(ctx, cx - 14, p.y + 30, 28, 26, 4, pickBy(p.v, ['#3b82f6', '#ef4444', '#22c55e']));
  circle(ctx, cx, p.y + 20, 11, '#fde68a');
  poly(ctx, [[cx - 20, p.y + 12], [cx + 20, p.y + 12], [cx, p.y - 2]], '#d97706');
}

function tractor(ctx, p) {
  const x = p.x + 12;
  const base = p.y + p.h - 6;
  shadow(ctx, p.x + p.w / 2, base, p.w * 0.42, 6);
  rrect(ctx, x, base - 40, 70, 24, 6, '#16a34a');
  rrect(ctx, x + 8, base - 66, 34, 28, 4, '#16a34a');
  rrect(ctx, x + 13, base - 61, 24, 16, 2, '#dbeafe', false);
  line(ctx, x + 60, base - 40, x + 60, base - 58, '#374151', 4);
  circle(ctx, x + 16, base - 16, 17, '#374151');
  circle(ctx, x + 16, base - 16, 7, '#facc15', false);
  circle(ctx, x + 72, base - 10, 10, '#374151');
}

export default {
  key: 'farm',
  name: 'Nông trại',
  icon: '🌾',
  topBand: 3,
  propShare: 0.3,
  decorDensity: 0.8,
  decorTypes: ['tuft', 'tuft', 'flower'],
  decorColors: ['#ffffff', '#fde047'],
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { field, hay, fence, pumpkin, scarecrow, tractor, tree },
  decor: { tuft, flower },
};
