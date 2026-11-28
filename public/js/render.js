import { drawCharacter } from './characters.js';
import { THEMES } from './themes/index.js';

const TAU = Math.PI * 2;

const CACHE_MAX_SIDE = 4096;
// Điện thoại (màn hình cảm ứng) dùng ảnh đệm nhỏ hơn để không bị trình duyệt giết tab vì hết bộ nhớ.
const IS_TOUCH = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const CACHE_MAX_PIXELS = IS_TOUCH ? 9_000_000 : 14_000_000; // dưới giới hạn canvas của Safari iOS (~16.7M pixel)
const CACHE_MAX_SCALE = 2;

const inRect = (x, y, pad, r) => x + pad > r.x0 && x - pad < r.x1 && y + pad > r.y0 && y - pad < r.y1;

// Vùng nền đất cần vẽ (bên dưới dải cảnh phía trên), cắt theo vùng đang nhìn thấy.
function groundArea(scene, rect) {
  const r = rect || { x0: 0, y0: 0, x1: scene.width, y1: scene.height };
  return {
    x0: Math.max(0, r.x0),
    y0: Math.max(scene.top, r.y0),
    x1: Math.min(scene.width, r.x1),
    y1: Math.min(scene.height, r.y1),
  };
}

function itemVisible(item, rect) {
  if (!rect) return true;
  if (!item.prop) return inRect(item.x, item.y, item.s, rect);
  return inRect(item.x + item.w / 2, item.y + item.h / 2, Math.max(item.w, item.h), rect);
}

function drawItem(ctx, theme, item) {
  if (item.prop) theme.props[item.type](ctx, item);
  else drawCharacter(ctx, item);
}

// Vẽ bức hình; nếu có `rect` thì chỉ vẽ những gì nằm trong vùng đó (dùng khi zoom gần).
export function drawScene(ctx, scene, rect = null) {
  const theme = THEMES[scene.theme];
  const area = groundArea(scene, rect);
  if (area.y1 > area.y0) theme.ground(ctx, scene, area);
  if (!rect || rect.y0 < scene.top) theme.band(ctx, scene);
  drawDecor(ctx, theme, scene, rect);
  for (const item of scene.layers) {
    if (itemVisible(item, rect)) drawItem(ctx, theme, item);
  }
}

function drawDecor(ctx, theme, scene, rect) {
  for (const d of scene.decor) {
    if (!rect || inRect(d.x, d.y, 20, rect)) theme.decor[d.type](ctx, d);
  }
}

// Vẽ sẵn toàn bộ bức hình vào 1 canvas đệm => kéo / zoom xa chỉ cần dán ảnh, rất nhẹ kể cả 3000 con.
export function createSceneCache(scene) {
  const bySide = CACHE_MAX_SIDE / Math.max(scene.width, scene.height);
  const byArea = Math.sqrt(CACHE_MAX_PIXELS / (scene.width * scene.height));
  const scale = Math.min(CACHE_MAX_SCALE, bySide, byArea);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(scene.width * scale);
  canvas.height = Math.ceil(scene.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  drawScene(ctx, scene);
  return { canvas, scale };
}

// Vị trí & bán kính vòng tròn đánh dấu quanh một nhân vật.
export const markerOf = (c) => ({ x: c.x, y: c.y + c.s * 0.05, r: c.s * 0.6 });

export function drawRing(ctx, x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, r * 0.14);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

export function drawCross(ctx, x, y, size, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = size * 0.3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.moveTo(x + size, y - size);
  ctx.lineTo(x - size, y + size);
  ctx.stroke();
  ctx.restore();
}

export function drawHint(ctx, hint) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 230, 0, 0.18)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = Math.max(4, hint.r * 0.03);
  ctx.setLineDash([ctx.lineWidth * 3, ctx.lineWidth * 2]);
  ctx.beginPath();
  ctx.arc(hint.x, hint.y, hint.r, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Vẽ ảnh chân dung (thẻ tham chiếu Bubu / Dudu).
export function drawPortrait(canvas, spec) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  const pose = { rot: 0, flip: false, eyes: 'dot', mouth: 'w', wave: false, extra: null, held: null };
  drawCharacter(ctx, { ...spec, ...pose, x: w / 2, y: h * 0.52, s: h * 0.92 });
}

// Bong bóng thoại (kích thước theo pixel màn hình, không phụ thuộc mức zoom).
export function drawBubble(ctx, x, y, str, scale, k) {
  const u = 1 / scale;
  const pop = Math.min(1, k * 8);
  ctx.save();
  ctx.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
  ctx.translate(x, y);
  ctx.scale(pop, pop);
  ctx.font = `700 ${15 * u}px 'Baloo 2', system-ui, sans-serif`;
  const w = ctx.measureText(str).width + 22 * u;
  const h = 30 * u;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#3b2a22';
  ctx.lineWidth = 2 * u;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h - 9 * u, w, h, 14 * u);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-7 * u, -10 * u);
  ctx.lineTo(0, 0);
  ctx.lineTo(7 * u, -10 * u);
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(-6 * u, -12 * u, 12 * u, 4 * u);
  ctx.fillStyle = '#3b2a22';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, 0, -9 * u - h / 2);
  ctx.restore();
}

// Pháo giấy bung ra từ (e.x, e.y); t = giây đã trôi qua.
export function drawConfetti(ctx, e, t, scale, alpha) {
  const u = 1 / scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (const p of e.parts) {
    ctx.save();
    ctx.translate(e.x + p.vx * t * u, e.y + (p.vy * t + 520 * t * t) * u);
    ctx.rotate(p.rot + p.spin * t);
    ctx.fillStyle = p.color;
    ctx.fillRect(-5 * u, -2.5 * u, 10 * u, 5 * u);
    ctx.restore();
  }
  ctx.restore();
}
