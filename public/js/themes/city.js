// 🏙️ Phố đi bộ: dãy nhà & cửa hàng phía trên, vỉa hè lát gạch, đèn đường, ghế, chậu cây, xe bán hàng, thùng rác.
import { hash, pickBy, rrect, line, shadow, text, fillArea, vgrad, eachTile } from './common.js';
import { scatterProps } from './layout.js';
import { lamp, bench, planter, flowerpot, foodcart, leaf, PAIRS } from './props.js';

const BRICK_W = 52;
const BRICK_H = 26;
const WALLS = ['#fca5a5', '#fcd34d', '#93c5fd', '#a7f3d0', '#f9a8d4', '#c4b5fd', '#fdba74'];
const SHOPS = ['Cà phê', 'Bánh ngọt', 'Trà sữa', 'Hoa tươi', 'Sách', 'Kem', 'Đồ chơi', 'Phở'];
const SPECS = [
  { type: 'lamp', w: 1, h: 1, weight: 3 },
  { type: 'bench', w: 2, h: 1, weight: 3 },
  { type: 'planter', w: 1, h: 1, weight: 4 },
  { type: 'flowerpot', w: 1, h: 1, weight: 2 },
  { type: 'foodcart', w: 2, h: 1, weight: 2 },
  { type: 'bin', w: 1, h: 1, weight: 1 },
];

function windows(ctx, x, y, w, h) {
  for (let wy = y + 16; wy < y + h - 70; wy += 40) {
    for (let wx = x + 14; wx < x + w - 30; wx += 36) rrect(ctx, wx, wy, 22, 26, 3, '#e0f2fe', true, 1.5);
  }
}

function building(ctx, x, w, top, i) {
  const h = top * (0.7 + hash(i, 1) * 0.3);
  const y = top - h;
  rrect(ctx, x, y, w, h, 4, pickBy(hash(i, 2), WALLS));
  windows(ctx, x, y, w, h);
  const colors = pickBy(hash(i, 3), PAIRS);
  for (let k = 0; k < 6; k++) rrect(ctx, x + (w * k) / 6, top - 66, w / 6, 18, 0, colors[k % 2], false);
  rrect(ctx, x + w * 0.3, top - 44, w * 0.4, 44, 2, '#7c4a2d');
  rrect(ctx, x + 10, top - 90, w - 20, 22, 6, '#fff');
  text(ctx, pickBy(hash(i, 4), SHOPS), x + w / 2, top - 79, 15);
}

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#bae6fd', '#e0f2fe']);
  ctx.fillRect(0, 0, w, top);
  for (let x = 0, i = 0; x < w; i++) {
    const bw = 150 + hash(i, 5) * 100;
    building(ctx, x, bw, top, i);
    x += bw + 6;
  }
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#e9dfd1');
  ctx.strokeStyle = '#d6c8b4';
  ctx.lineWidth = 1.5;
  eachTile(area, BRICK_W, BRICK_H, (c, r) => {
    ctx.strokeRect(c * BRICK_W + (r % 2) * (BRICK_W / 2), r * BRICK_H, BRICK_W, BRICK_H);
  });
}

function bin(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 16, 5);
  rrect(ctx, cx - 13, base - 36, 26, 36, 4, '#22c55e');
  rrect(ctx, cx - 16, base - 42, 32, 8, 3, '#15803d');
  line(ctx, cx - 4, base - 28, cx - 4, base - 8, '#15803d', 2);
  line(ctx, cx + 4, base - 28, cx + 4, base - 8, '#15803d', 2);
}

export default {
  key: 'city',
  name: 'Phố đi bộ',
  icon: '🏙️',
  topBand: 3,
  propShare: 0.26,
  decorDensity: 0.25,
  decorTypes: ['leaf'],
  decorColors: ['#86c06c', '#e9a23b', '#d97706'],
  band,
  ground,
  layout: (rnd, grid) => scatterProps(rnd, grid, SPECS),
  props: { lamp, bench, planter, flowerpot, foodcart, bin },
  decor: { leaf },
};
