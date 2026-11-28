// Sinh bức hình từ seed + mức độ + bối cảnh. Cùng input => cùng kết quả trên mọi máy.
import { mulberry32, pick, range, shuffle } from './rng.js';
import { TARGET_SPECS, makeDecoy, hitLocal, randomMood } from './characters.js';
import { spriteHit } from './sprites.js';
import { THEMES, resolveTheme } from './themes/index.js';
import { makeGrid, freeCells } from './themes/layout.js';

export const LEVELS = {
  easy: { count: 500, tricky: 0.25, label: 'Dễ' },
  medium: { count: 1000, tricky: 0.45, label: 'Vừa' },
  hard: { count: 3000, tricky: 0.65, label: 'Khó' },
};

const CELL_W = 62;
const CELL_H = 78;
const LOOK_SALT = 0x5bd1e995;
const PROP_FILL = 0.85; // dùng 85% số ô dư cho đồ vật, phần còn lại để trống cho thoáng
const NO_SPRITES = { bubu: [], dudu: [] };
// Tỉ lệ cột/hàng của lưới: 'portrait' => bản đồ dọc (hợp điện thoại), 'landscape' => bản đồ ngang.
const SHAPE_RATIO = { portrait: 0.75, landscape: 1.7 };

// Hai luồng ngẫu nhiên tách biệt: "layout" (vị trí, đồ vật) và "looks" (ngoại hình / ảnh).
// Nhờ vậy vị trí Bubu/Dudu luôn giống nhau trên 2 máy kể cả khi số ảnh tải được khác nhau.
export function buildScene(seed, levelKey, sprites = NO_SPRITES, themeKey = 'random', shape = 'portrait') {
  const level = LEVELS[levelKey] ? levelKey : 'easy';
  const cfg = LEVELS[level];
  const theme = THEMES[resolveTheme(themeKey, seed)];
  const layout = mulberry32(seed);
  const looks = mulberry32(seed ^ LOOK_SALT);

  const totalCells = Math.ceil(cfg.count / (1 - theme.propShare));
  const cols = Math.ceil(Math.sqrt(totalCells * (SHAPE_RATIO[shape] || SHAPE_RATIO.portrait)));
  const rows = Math.ceil(totalCells / cols);
  const grid = makeGrid(cols, rows, Math.floor((cols * rows - cfg.count) * PROP_FILL));
  const top = theme.topBand * CELL_H;
  const props = theme.layout(layout, grid).map((p) => propRect(p, top));

  const cells = shuffle(layout, freeCells(grid)).slice(0, cfg.count);
  const chars = cells
    .map((cell, i) => ({ ...place(layout, cell, top), ...specFor(i, looks, cfg, sprites) }))
    .sort((a, b) => a.y - b.y);
  const layers = [...chars, ...props].sort((a, b) => baseOf(a) - baseOf(b));

  const width = (cols + 1) * CELL_W;
  const height = (rows + 1) * CELL_H + top;
  const decor = makeDecor(layout, theme, width, height, top);
  return { seed, level, theme: theme.key, width, height, top, chars, layers, decor };
}

function specFor(i, rnd, cfg, sprites) {
  if (i === 0) return targetSpec('bubu', rnd, sprites);
  if (i === 1) return targetSpec('dudu', rnd, sprites);
  return makeDecoy(rnd, rnd() < cfg.tricky);
}

function targetSpec(target, rnd, sprites) {
  const list = sprites[target];
  const base = { ...TARGET_SPECS[target], held: null }; // hàng thật không cầm đồ
  return list.length ? { ...base, sprite: pick(rnd, list) } : base;
}

function place(rnd, cell, top) {
  return {
    x: (cell.c + 1) * CELL_W + range(rnd, -0.18, 0.18) * CELL_W,
    y: top + (cell.r + 1) * CELL_H + range(rnd, -0.12, 0.12) * CELL_H,
    s: CELL_H * range(rnd, 1, 1.2),
    rot: range(rnd, -0.3, 0.3),
    flip: rnd() < 0.5,
    wave: rnd() < 0.25,
    ...randomMood(rnd),
  };
}

// Đổi ô lưới của đồ vật sang hình chữ nhật trong thế giới (khớp với vùng nhân vật đứng).
function propRect(p, top) {
  return {
    prop: true,
    type: p.type,
    v: p.v,
    x: (p.c + 0.5) * CELL_W,
    y: top + (p.r + 0.5) * CELL_H,
    w: p.w * CELL_W,
    h: p.h * CELL_H,
  };
}

// Thứ tự vẽ theo "chân" (đáy): cái nào thấp hơn trên màn hình thì vẽ sau => che cái phía sau.
const baseOf = (item) => (item.prop ? item.y + item.h : item.y + item.s * 0.45);

function makeDecor(rnd, theme, width, height, top) {
  const count = Math.round((((height - top) * width) / 4000) * theme.decorDensity);
  return Array.from({ length: count }, () => ({
    type: pick(rnd, theme.decorTypes),
    x: rnd() * width,
    y: top + rnd() * (height - top),
    color: pick(rnd, theme.decorColors),
    s: range(rnd, 6, 12),
    rot: rnd() * Math.PI * 2,
  }));
}

function toLocal(c, x, y) {
  const dx = x - c.x;
  const dy = y - c.y;
  const cos = Math.cos(-c.rot);
  const sin = Math.sin(-c.rot);
  const lx = (dx * cos - dy * sin) / c.s;
  const ly = (dx * sin + dy * cos) / c.s;
  return [c.flip ? -lx : lx, ly];
}

// Trả về nhân vật nằm trên cùng tại điểm (x, y) của thế giới, hoặc null.
export function hitTest(scene, x, y) {
  for (let i = scene.chars.length - 1; i >= 0; i--) {
    const c = scene.chars[i];
    const near = Math.abs(x - c.x) <= c.s && Math.abs(y - c.y) <= c.s;
    if (near && hitChar(c, ...toLocal(c, x, y))) return c;
  }
  return null;
}

// Dò quanh điểm chạm (2 vòng, 8 hướng) xem có Bubu/Dudu nằm sát đó không – bù cho ngón tay chạm lệch.
export function findTargetNear(scene, x, y, radius) {
  for (const r of [radius * 0.5, radius]) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const hit = hitTest(scene, x + Math.cos(a) * r, y + Math.sin(a) * r);
      if (hit?.target) return hit;
    }
  }
  return null;
}

function hitChar(c, lx, ly) {
  return c.sprite ? spriteHit(c.sprite, lx, ly) : hitLocal(lx, ly);
}
