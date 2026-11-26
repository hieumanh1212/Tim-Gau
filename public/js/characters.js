// Vẽ nhân vật bằng Canvas 2D.
// Toạ độ cục bộ: nhân vật cao ~1 đơn vị, tâm ở (0,0), đầu ở trên (y âm), chân ở dưới (y dương).
import { pick } from './rng.js';
import { spriteBox } from './sprites.js';

const TAU = Math.PI * 2;
const OUTLINE = '#3b2a22';
const DARK = '#2b2b2b';
const BLUSH = 'rgba(255,110,130,0.45)';
const PINK_INNER = '#f6c5c9';
export const WHITE = '#fbfaf5';
export const BROWN = '#8a5a3b';

// Bubu = gấu trắng, Dudu = gấu nâu. Không phụ kiện => đó là "hàng thật".
export const TARGET_SPECS = {
  bubu: { kind: 'bear', body: WHITE, inner: PINK_INNER, muzzle: null, acc: null, target: 'bubu' },
  dudu: { kind: 'bear', body: BROWN, inner: '#d9a77e', muzzle: '#d7b08a', acc: null, target: 'dudu' },
};

// Màu "na ná" để đánh lừa người chơi ở mức khó.
const NEAR_COLORS = {
  bubu: ['#e9d3ad', '#c9c9c9', '#f7cfd8'],
  dudu: ['#5b3a29', '#c98a4b', '#7d7d7d'],
};
const OTHER_BODIES = ['#e9d3ad', '#c4c4c4', '#5b3a29', '#c98a4b', '#f4b6c2', '#a9cfe8', '#f5e07a', '#b9dc9f', '#ffd2a6', '#d6c1f0'];
const ACC_COLORS = ['#e94b5a', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#ec4899'];
const ACCS = ['bow', 'hat', 'scarf', 'glasses', 'flower', 'crown', 'sunglasses', 'mustache'];
const LOOKALIKE_KINDS = ['cat', 'bunny', 'dog'];
const ALL_KINDS = ['bear', 'cat', 'bunny', 'dog', 'panda', 'pig'];
// ---------- Sinh nhân vật mồi (decoy) ----------
// Đồ giả luôn là thú vẽ bằng code => ảnh Bubu/Dudu chỉ xuất hiện đúng 1 lần mỗi màn.
export function makeDecoy(rnd, tricky) {
  return tricky ? makeTricky(rnd) : makeRegular(rnd);
}

function makeTricky(rnd) {
  const base = TARGET_SPECS[pick(rnd, ['bubu', 'dudu'])];
  const variant = Math.floor(rnd() * 3);
  const decoy = { ...base, target: null, accColor: pick(rnd, ACC_COLORS) };
  if (variant === 0) return { ...decoy, acc: pick(rnd, ACCS) };
  if (variant === 1) return { ...decoy, kind: pick(rnd, LOOKALIKE_KINDS) };
  return { ...decoy, body: pick(rnd, NEAR_COLORS[base.target]) };
}

function makeRegular(rnd) {
  const kind = pick(rnd, ALL_KINDS);
  const body = kind === 'panda' ? WHITE : pick(rnd, OTHER_BODIES);
  const acc = rnd() < 0.35 ? pick(rnd, ACCS) : null;
  const muzzle = rnd() < 0.3 ? '#f3e3cf' : null;
  return { kind, body, inner: PINK_INNER, muzzle, acc, accColor: pick(rnd, ACC_COLORS), target: null };
}

// ---------- Hình cơ bản ----------
function blob(ctx, x, y, rx, ry, fill, rot = 0, stroke = true) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) ctx.stroke();
}

function dot(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

function poly(ctx, pts, fill, stroke = true) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) ctx.stroke();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------- Tai theo loài ----------
function roundEars(ctx, c, color = c.body) {
  const inner = color === DARK ? '#555' : c.inner;
  for (const sx of [-1, 1]) {
    blob(ctx, sx * 0.21, -0.34, 0.095, 0.095, color);
    blob(ctx, sx * 0.21, -0.34, 0.05, 0.05, inner, 0, false);
  }
}

function catEars(ctx, c) {
  for (const sx of [-1, 1]) {
    poly(ctx, [[sx * 0.28, -0.2], [sx * 0.25, -0.5], [sx * 0.06, -0.36]], c.body);
    poly(ctx, [[sx * 0.24, -0.26], [sx * 0.23, -0.43], [sx * 0.12, -0.35]], c.inner, false);
  }
}

function bunnyEars(ctx, c) {
  for (const sx of [-1, 1]) {
    blob(ctx, sx * 0.11, -0.48, 0.07, 0.2, c.body, sx * 0.15);
    blob(ctx, sx * 0.11, -0.47, 0.035, 0.14, c.inner, sx * 0.15, false);
  }
}

function dogEars(ctx, c) {
  for (const sx of [-1, 1]) {
    blob(ctx, sx * 0.28, -0.12, 0.08, 0.17, c.body, sx * 0.35);
    blob(ctx, sx * 0.28, -0.12, 0.08, 0.17, 'rgba(60,40,30,0.25)', sx * 0.35, false);
  }
}

function pigEars(ctx, c) {
  for (const sx of [-1, 1]) {
    poly(ctx, [[sx * 0.12, -0.35], [sx * 0.28, -0.44], [sx * 0.26, -0.26]], c.body);
  }
}

const KINDS = {
  bear: { earsBack: roundEars },
  panda: { earsBack: (ctx, c) => roundEars(ctx, c, DARK), limb: DARK, patches: true },
  cat: { earsBack: catEars, whiskers: true },
  bunny: { earsBack: bunnyEars },
  dog: { earsFront: dogEars },
  pig: { earsBack: pigEars, snout: true },
};

// ---------- Thân & mặt ----------
function drawBody(ctx, c, look) {
  const limb = look.limb || c.body;
  blob(ctx, 0, 0.48, 0.25, 0.05, 'rgba(0,0,0,0.12)', 0, false);
  for (const sx of [-1, 1]) blob(ctx, sx * 0.13, 0.43, 0.09, 0.06, limb);
  blob(ctx, 0, 0.2, 0.26, 0.25, c.body);
  blob(ctx, -0.24, 0.16, 0.065, 0.12, limb, 0.5);
  if (c.wave) blob(ctx, 0.27, -0.02, 0.065, 0.12, limb, -1);
  else blob(ctx, 0.24, 0.16, 0.065, 0.12, limb, -0.5);
}

// ---------- Biểu cảm ----------
const EYE_STYLES = ['dot', 'dot', 'dot', 'dot', 'happy', 'happy', 'wink', 'sleepy'];
const MOUTHS = ['w', 'w', 'w', 'smile', 'open', 'open', 'o', 'tongue'];
const EXTRAS = ['heart', 'zzz', 'note', 'sweat', 'sparkle'];
const HELD = ['icecream', 'balloon', 'lollipop'];

// Ngẫu nhiên biểu cảm, bong bóng cảm xúc và đồ cầm tay cho một nhân vật.
export function randomMood(rnd) {
  const eyes = pick(rnd, EYE_STYLES);
  const mouth = pick(rnd, MOUTHS);
  const wantsExtra = rnd() < 0.18;
  const extra = wantsExtra ? pick(rnd, EXTRAS) : null;
  const held = rnd() < 0.15 ? pick(rnd, HELD) : null;
  return { eyes, mouth, extra: eyes === 'sleepy' && wantsExtra ? 'zzz' : extra, held };
}

// Mắt tròn có đốm sáng long lanh.
function sparklyEye(ctx, x, y, color) {
  dot(ctx, x, y, 0.032, color);
  if (color === DARK) dot(ctx, x + 0.011, y - 0.012, 0.011, '#fff');
}

function sleepyEye(ctx, x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.022;
  line(ctx, x - 0.03, y + 0.005, x + 0.03, y + 0.005);
  ctx.restore();
}

const EYE_DRAW = { dot: sparklyEye, happy: happyEye, sleepy: sleepyEye };

function drawEyes(ctx, c, look) {
  const color = look.patches ? '#fff' : DARK;
  for (const sx of [-1, 1]) {
    const winkLeft = sx < 0 ? 'happy' : 'dot';
    const style = c.eyes === 'wink' ? winkLeft : c.eyes;
    (EYE_DRAW[style] || sparklyEye)(ctx, sx * 0.1, -0.12, color);
  }
}

function happyEye(ctx, x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.025;
  ctx.beginPath();
  ctx.arc(x, y + 0.015, 0.03, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.restore();
}

function wMouth(ctx) {
  ctx.save();
  ctx.lineWidth = 0.02;
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(sx * 0.025, -0.045, 0.025, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
  ctx.restore();
}

function smileMouth(ctx) {
  ctx.save();
  ctx.lineWidth = 0.02;
  ctx.beginPath();
  ctx.arc(0, -0.07, 0.05, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.restore();
}

// Miệng há cười to, có lưỡi hồng.
function openMouth(ctx) {
  ctx.save();
  ctx.lineWidth = 0.018;
  ctx.beginPath();
  ctx.moveTo(-0.045, -0.045);
  ctx.quadraticCurveTo(0, 0.04, 0.045, -0.045);
  ctx.closePath();
  ctx.fillStyle = '#7a2e2e';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  blob(ctx, 0, -0.012, 0.022, 0.014, '#ff7a90', 0, false);
}

function oMouth(ctx) {
  ctx.save();
  ctx.lineWidth = 0.018;
  blob(ctx, 0, -0.025, 0.02, 0.026, '#7a2e2e');
  ctx.restore();
}

function tongueMouth(ctx) {
  ctx.save();
  ctx.lineWidth = 0.015;
  blob(ctx, 0.012, -0.012, 0.02, 0.026, '#ff7a90');
  ctx.restore();
  wMouth(ctx);
}

const MOUTH_DRAW = { w: wMouth, smile: smileMouth, open: openMouth, o: oMouth, tongue: tongueMouth };

function drawNoseMouth(ctx, c) {
  (MOUTH_DRAW[c.mouth] || wMouth)(ctx);
  blob(ctx, 0, -0.065, 0.032, 0.022, DARK, 0, false);
}

function drawSnout(ctx) {
  blob(ctx, 0, -0.04, 0.085, 0.06, '#f29bb0');
  for (const sx of [-1, 1]) dot(ctx, sx * 0.03, -0.04, 0.015, DARK);
}

function drawPatches(ctx) {
  for (const sx of [-1, 1]) blob(ctx, sx * 0.1, -0.12, 0.065, 0.08, DARK, sx * -0.5, false);
}

function drawWhiskers(ctx) {
  ctx.save();
  ctx.lineWidth = 0.012;
  for (const sx of [-1, 1]) {
    line(ctx, sx * 0.14, -0.05, sx * 0.31, -0.09);
    line(ctx, sx * 0.14, -0.03, sx * 0.31, -0.01);
  }
  ctx.restore();
}

function drawFace(ctx, c, look) {
  if (look.patches) drawPatches(ctx);
  if (c.muzzle) blob(ctx, 0, -0.03, 0.11, 0.075, c.muzzle, 0, false);
  drawEyes(ctx, c, look);
  if (look.snout) drawSnout(ctx);
  else drawNoseMouth(ctx, c);
  for (const sx of [-1, 1]) blob(ctx, sx * 0.18, -0.04, 0.045, 0.03, BLUSH, 0, false);
  if (look.whiskers) drawWhiskers(ctx);
}

// ---------- Phụ kiện (có phụ kiện => KHÔNG phải Bubu/Dudu) ----------
const ACCESSORIES = {
  bow(ctx, c) {
    const x = 0.16;
    const y = -0.38;
    poly(ctx, [[x, y], [x - 0.11, y - 0.07], [x - 0.11, y + 0.07]], c.accColor);
    poly(ctx, [[x, y], [x + 0.11, y - 0.07], [x + 0.11, y + 0.07]], c.accColor);
    blob(ctx, x, y, 0.03, 0.03, c.accColor);
  },
  hat(ctx, c) {
    poly(ctx, [[-0.14, -0.33], [0.14, -0.33], [0.02, -0.68]], c.accColor);
    blob(ctx, 0.02, -0.68, 0.045, 0.045, '#fff');
  },
  scarf(ctx, c) {
    poly(ctx, [[0.06, 0.15], [0.18, 0.15], [0.16, 0.34], [0.05, 0.32]], c.accColor);
    blob(ctx, 0, 0.15, 0.22, 0.05, c.accColor);
  },
  glasses(ctx, c) {
    ctx.save();
    ctx.strokeStyle = c.accColor;
    ctx.lineWidth = 0.022;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * 0.1, -0.12, 0.058, 0, TAU);
      ctx.stroke();
    }
    line(ctx, -0.042, -0.12, 0.042, -0.12);
    ctx.restore();
  },
  flower(ctx, c) {
    const x = -0.2;
    const y = -0.32;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      dot(ctx, x + Math.cos(a) * 0.045, y + Math.sin(a) * 0.045, 0.035, c.accColor);
    }
    dot(ctx, x, y, 0.028, '#fde047');
  },
  crown(ctx) {
    poly(ctx, [[-0.13, -0.33], [0.13, -0.33], [0.15, -0.5], [0.07, -0.41], [0, -0.53], [-0.07, -0.41], [-0.15, -0.5]], '#f5c518');
  },
  sunglasses(ctx) {
    for (const sx of [-1, 1]) {
      blob(ctx, sx * 0.1, -0.12, 0.068, 0.048, '#1f2937');
      blob(ctx, sx * 0.1 - 0.025, -0.135, 0.018, 0.01, 'rgba(255,255,255,0.7)', -0.4, false);
    }
    line(ctx, -0.035, -0.13, 0.035, -0.13);
  },
  mustache(ctx) {
    for (const sx of [-1, 1]) blob(ctx, sx * 0.05, -0.04, 0.055, 0.022, DARK, sx * 0.35, false);
  },
};

// ---------- Bong bóng cảm xúc (vẽ không lật để chữ/hình không bị ngược) ----------
function heart(ctx, x, y, s, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.6);
  ctx.bezierCurveTo(x - s * 1.2, y - s * 0.2, x - s * 0.5, y - s, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.5, y - s, x + s * 1.2, y - s * 0.2, x, y + s * 0.6);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

function zLetter(ctx, x, y, s) {
  ctx.save();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 0.022;
  ctx.beginPath();
  ctx.moveTo(x - s / 2, y - s / 2);
  ctx.lineTo(x + s / 2, y - s / 2);
  ctx.lineTo(x - s / 2, y + s / 2);
  ctx.lineTo(x + s / 2, y + s / 2);
  ctx.stroke();
  ctx.restore();
}

function star4(ctx, x, y, s, fill) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const r = i % 2 ? s * 0.35 : s;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  poly(ctx, pts, fill);
}

const EXTRA_DRAW = {
  heart: (ctx) => heart(ctx, 0.36, -0.44, 0.075, '#ff5d8f'),
  zzz: (ctx) => {
    zLetter(ctx, 0.3, -0.42, 0.06);
    zLetter(ctx, 0.41, -0.53, 0.04);
  },
  note: (ctx) => {
    blob(ctx, 0.34, -0.38, 0.03, 0.022, DARK, -0.4, false);
    line(ctx, 0.365, -0.385, 0.365, -0.5);
    line(ctx, 0.365, -0.5, 0.41, -0.47);
  },
  sweat: (ctx) => {
    ctx.beginPath();
    ctx.moveTo(0.3, -0.36);
    ctx.quadraticCurveTo(0.35, -0.28, 0.3, -0.25);
    ctx.quadraticCurveTo(0.25, -0.28, 0.3, -0.36);
    ctx.fillStyle = '#7dd3fc';
    ctx.fill();
    ctx.stroke();
  },
  sparkle: (ctx) => star4(ctx, 0.36, -0.42, 0.06, '#fde047'),
};

function drawExtra(ctx, c) {
  if (!EXTRA_DRAW[c.extra]) return;
  ctx.save();
  if (c.flip) ctx.scale(-1, 1);
  EXTRA_DRAW[c.extra](ctx);
  ctx.restore();
}

// ---------- Đồ cầm tay (tay phải, khi không vẫy tay) ----------
const HELD_DRAW = {
  icecream(ctx) {
    poly(ctx, [[0.265, 0.1], [0.355, 0.1], [0.31, 0.24]], '#e9b872');
    blob(ctx, 0.31, 0.065, 0.05, 0.045, '#f9a8d4');
    dot(ctx, 0.31, 0.015, 0.015, '#ef4444');
  },
  balloon(ctx, c) {
    ctx.save();
    ctx.lineWidth = 0.01;
    line(ctx, 0.3, 0.14, 0.4, -0.36);
    ctx.restore();
    blob(ctx, 0.4, -0.46, 0.075, 0.095, c.accColor || '#ef4444');
    blob(ctx, 0.375, -0.5, 0.018, 0.028, 'rgba(255,255,255,0.6)', 0, false);
  },
  lollipop(ctx, c) {
    ctx.save();
    ctx.lineWidth = 0.02;
    line(ctx, 0.3, 0.16, 0.34, -0.02);
    ctx.restore();
    blob(ctx, 0.35, -0.07, 0.055, 0.055, c.accColor || '#ec4899');
    blob(ctx, 0.35, -0.07, 0.025, 0.025, '#fff', 0, false);
  },
};

function drawHeld(ctx, c) {
  if (c.wave || !HELD_DRAW[c.held]) return;
  HELD_DRAW[c.held](ctx, c);
}

// ---------- API chính ----------
export function drawCharacter(ctx, c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.rot || 0);
  ctx.scale(c.flip ? -c.s : c.s, c.s);
  ctx.lineWidth = 0.03;
  ctx.strokeStyle = OUTLINE;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (c.sprite) drawSpriteChar(ctx, c);
  else drawVectorChar(ctx, c);
  ctx.restore();
}

function drawSpriteChar(ctx, c) {
  const b = spriteBox(c.sprite);
  blob(ctx, 0, 0.48, 0.25, 0.05, 'rgba(0,0,0,0.12)', 0, false);
  ctx.drawImage(c.sprite.canvas, b.x, b.y, b.w, b.h);
}

function drawVectorChar(ctx, c) {
  const look = KINDS[c.kind] || KINDS.bear;
  drawBody(ctx, c, look);
  look.earsBack?.(ctx, c);
  blob(ctx, 0, -0.12, 0.3, 0.27, c.body);
  look.earsFront?.(ctx, c);
  drawFace(ctx, c, look);
  drawHeld(ctx, c);
  if (c.acc) ACCESSORIES[c.acc](ctx, c);
  drawExtra(ctx, c);
}

// Điểm (lx, ly) trong toạ độ cục bộ có nằm trên đầu/thân nhân vật không.
export function hitLocal(lx, ly) {
  const head = (lx / 0.34) ** 2 + ((ly + 0.15) / 0.34) ** 2 <= 1;
  const body = (lx / 0.3) ** 2 + ((ly - 0.22) / 0.29) ** 2 <= 1;
  return head || body;
}
