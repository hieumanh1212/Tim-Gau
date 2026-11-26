// 🛒 Siêu thị: tường có biển hiệu & tủ mát, sàn gạch caro, dãy kệ hàng tạo lối đi, xe đẩy, sạp trái cây, quầy thu ngân.
import { hash, pickBy, rrect, circle, poly, line, shadow, text, fillArea, vgrad, eachTile } from './common.js';
import { scatterProps, tryPlace } from './layout.js';
import { flowerpot } from './props.js';

const TILE = 52;
const GOODS = ['#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ffffff', '#fb923c'];
const FRUITS = ['#ef4444', '#fb923c', '#84cc16', '#facc15', '#a855f7'];
const AISLES = ['Rau củ', 'Bánh kẹo', 'Đồ uống', 'Sữa', 'Đồ chơi', 'Mì gói', 'Trái cây', 'Đông lạnh'];
const SCATTER = [
  { type: 'cart', w: 1, h: 1, weight: 5 },
  { type: 'crate', w: 2, h: 1, weight: 3 },
  { type: 'sale', w: 1, h: 1, weight: 2 },
  { type: 'checkout', w: 2, h: 1, weight: 1, max: 2 },
  { type: 'flowerpot', w: 1, h: 1, weight: 1 },
];

function band(ctx, scene) {
  const { width: w, top } = scene;
  ctx.fillStyle = vgrad(ctx, 0, top, ['#fff4dc', '#fde7c0']);
  ctx.fillRect(0, 0, w, top);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 0, w, 14);
  for (let x = 40, i = 0; x < w - 120; x += 260, i++) {
    rrect(ctx, x, 28, 120, 34, 8, pickBy(hash(i, 2), ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899']));
    text(ctx, AISLES[i % AISLES.length], x + 60, 46, 18, '#fff');
  }
  const signW = Math.min(520, w * 0.6);
  rrect(ctx, (w - signW) / 2, 20, signW, 52, 14, '#ef4444');
  text(ctx, 'SIÊU THỊ BUBU & DUDU', w / 2, 47, 30, '#fff');
  fridges(ctx, w, top);
}

function fridges(ctx, w, top) {
  for (let x = 10, i = 0; x < w - 10; x += 150, i++) {
    rrect(ctx, x, top - 72, 140, 66, 6, '#dbeafe');
    for (let k = 0; k < 9; k++) rrect(ctx, x + 8 + k * 14, top - 58 + (k % 2) * 4, 10, 22, 3, pickBy(hash(k + i * 9, 3), GOODS), true, 1);
    line(ctx, x + 4, top - 30, x + 136, top - 30, '#93c5fd', 3);
  }
}

function ground(ctx, scene, area) {
  fillArea(ctx, area, '#f5f2ea');
  ctx.fillStyle = '#e8e2d4';
  eachTile(area, TILE, TILE, (c, r) => {
    if ((c + r) % 2) ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
  });
}

// Dãy kệ hàng nằm ngang, cách nhau 4 hàng ô => tạo thành lối đi.
function shelfRows(rnd, grid) {
  const props = [];
  for (let r = 1; r < grid.rows - 1; r += 4) {
    let c = 1 + Math.floor(rnd() * 2);
    while (c < grid.cols - 3) {
      const len = Math.min(4 + Math.floor(rnd() * 4), grid.cols - c);
      const p = tryPlace(grid, { type: 'shelf', w: len, h: 1 }, c, r, rnd());
      if (p) props.push(p);
      c += len + 2;
    }
  }
  return props;
}

function shelfTier(ctx, x, y, w, h, v) {
  const n = Math.floor(w / 13);
  for (let i = 0; i < n; i++) {
    const ph = h * (0.55 + hash(i, v) * 0.45);
    rrect(ctx, x + i * 13, y + h - ph, 11, ph, 2, pickBy(hash(i + 7, v), GOODS), true, 1);
  }
  rrect(ctx, x - 3, y + h, w + 6, 4, 1, '#9ca3af', false);
}

function shelf(ctx, p) {
  const x = p.x + 3;
  const y = p.y + 6;
  const w = p.w - 6;
  const h = p.h - 12;
  shadow(ctx, p.x + p.w / 2, p.y + p.h - 4, w * 0.5, 6);
  rrect(ctx, x, y, w, h, 6, pickBy(p.v, ['#e5e7eb', '#dbeafe', '#fde2e2', '#dcfce7']));
  for (let tier = 0; tier < 2; tier++) shelfTier(ctx, x + 7, y + 4 + (tier * h) / 2, w - 14, h / 2 - 10, p.v + tier);
}

function cart(ctx, p) {
  const x = p.x + 10;
  const y = p.y + 24;
  const w = p.w - 20;
  shadow(ctx, p.x + p.w / 2, p.y + p.h - 8, w * 0.55, 6);
  line(ctx, x - 6, y - 12, x + 2, y, '#6b7280', 3);
  for (let i = 0; i < 3; i++) circle(ctx, x + 10 + i * 10, y - 4, 7, pickBy(hash(i, p.v), GOODS));
  poly(ctx, [[x, y], [x + w, y], [x + w - 6, y + 30], [x + 6, y + 30]], '#cbd5e1');
  for (let i = 1; i < 4; i++) line(ctx, x + (w * i) / 4, y + 2, x + (w * i) / 4, y + 28, '#94a3b8', 1.5);
  circle(ctx, x + 10, y + 40, 5, '#374151');
  circle(ctx, x + w - 10, y + 40, 5, '#374151');
}

function crate(ctx, p) {
  const x = p.x + 8;
  const w = p.w - 16;
  const fruit = pickBy(p.v, FRUITS);
  shadow(ctx, p.x + p.w / 2, p.y + p.h - 8, w / 2, 7);
  for (let i = 0; i < 7; i++) circle(ctx, x + 10 + i * ((w - 20) / 6), p.y + p.h * 0.4 - (i % 2) * 6, 9, fruit, true, 1.5);
  rrect(ctx, x, p.y + p.h * 0.45, w, p.h * 0.42, 5, '#c98a4b');
  line(ctx, x + 4, p.y + p.h * 0.66, x + w - 4, p.y + p.h * 0.66, '#9a6a45', 2);
  rrect(ctx, x + w / 2 - 16, p.y + p.h * 0.5, 32, 14, 3, '#fff', false);
  text(ctx, `${5 + Math.floor(p.v * 40)}k`, x + w / 2, p.y + p.h * 0.5 + 7, 11, '#ef4444');
}

function checkout(ctx, p) {
  const x = p.x + 6;
  const w = p.w - 12;
  shadow(ctx, p.x + p.w / 2, p.y + p.h - 6, w / 2, 7);
  rrect(ctx, x, p.y + p.h * 0.38, w, p.h * 0.52, 6, '#94a3b8');
  rrect(ctx, x + 4, p.y + p.h * 0.38, w * 0.6, 10, 3, '#334155', false);
  rrect(ctx, x + w * 0.68, p.y + p.h * 0.1, w * 0.28, p.h * 0.32, 4, '#475569');
  rrect(ctx, x + w * 0.71, p.y + p.h * 0.14, w * 0.22, p.h * 0.14, 2, '#86efac', false);
}

function sale(ctx, p) {
  const cx = p.x + p.w / 2;
  const base = p.y + p.h - 8;
  shadow(ctx, cx, base, 20, 5);
  rrect(ctx, cx - 22, base - 26, 44, 26, 3, '#fbbf24');
  line(ctx, cx, base - 26, cx, p.y + 30, '#6b7280', 3);
  rrect(ctx, cx - 26, p.y + 6, 52, 26, 6, '#ef4444');
  text(ctx, 'SALE', cx, p.y + 20, 15, '#fff');
}

export default {
  key: 'market',
  name: 'Siêu thị',
  icon: '🛒',
  topBand: 2,
  propShare: 0.36,
  decorDensity: 0,
  decorTypes: [],
  decorColors: [],
  band,
  ground,
  layout: (rnd, grid) => shelfRows(rnd, grid).concat(scatterProps(rnd, grid, SCATTER)),
  props: { shelf, cart, crate, checkout, sale, flowerpot },
  decor: {},
};
