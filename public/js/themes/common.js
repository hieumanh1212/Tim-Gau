// Hàm vẽ dùng chung cho các bối cảnh. Đơn vị = pixel thế giới (1 ô lưới = 62 x 78).
export const INK = '#3b2a22';
const TAU = Math.PI * 2;

// Số giả ngẫu nhiên cố định theo (i, v) – để chi tiết trang trí giống nhau trên mọi máy.
export function hash(i, v = 0) {
  const s = Math.sin(i * 12.9898 + v * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

export const pickBy = (t, arr) => arr[Math.floor(t * arr.length) % arr.length];

function finish(ctx, fill, stroke, lw) {
  ctx.fillStyle = fill;
  ctx.fill();
  if (!stroke) return;
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export function rrect(ctx, x, y, w, h, r, fill, stroke = true, lw = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  finish(ctx, fill, stroke, lw);
}

export function circle(ctx, x, y, r, fill, stroke = true, lw = 2) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  finish(ctx, fill, stroke, lw);
}

export function oval(ctx, x, y, rx, ry, fill, stroke = true, lw = 2, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  finish(ctx, fill, stroke, lw);
}

export function poly(ctx, pts, fill, stroke = true, lw = 2) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  finish(ctx, fill, stroke, lw);
}

export function line(ctx, x1, y1, x2, y2, color = INK, lw = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function shadow(ctx, x, y, rx, ry) {
  oval(ctx, x, y, rx, ry, 'rgba(0,0,0,0.13)', false);
}

export function text(ctx, str, x, y, size, color = INK) {
  ctx.font = `700 ${size}px 'Baloo 2', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

export function vgrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

export function fillArea(ctx, area, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(area.x0, area.y0, area.x1 - area.x0, area.y1 - area.y0);
}

// Gọi fn(c, r) cho mọi ô lưới kích thước (sw x sh) nằm trong vùng area.
export function eachTile(area, sw, sh, fn) {
  const c0 = Math.max(0, Math.floor(area.x0 / sw));
  const r0 = Math.max(0, Math.floor(area.y0 / sh));
  const c1 = Math.ceil(area.x1 / sw);
  const r1 = Math.ceil(area.y1 / sh);
  for (let r = r0; r < r1; r++) {
    for (let c = c0; c < c1; c++) fn(c, r);
  }
}

// Dải sọc tam giác (ô dù, mái lều, mái vòng quay ngựa gỗ).
export function stripedFan(ctx, apex, x0, x1, y, colors, n = 6) {
  for (let i = 0; i < n; i++) {
    const a = x0 + ((x1 - x0) * i) / n;
    const b = x0 + ((x1 - x0) * (i + 1)) / n;
    poly(ctx, [apex, [a, y], [b, y]], colors[i % colors.length]);
  }
}

// Mặt kawaii: 2 mắt tròn có đốm sáng, má hồng, miệng cười. s = tỉ lệ (1 ≈ mặt rộng 30px).
export function cuteFace(ctx, x, y, s = 1) {
  for (const sx of [-1, 1]) {
    circle(ctx, x + sx * 7 * s, y, 2.6 * s, INK, false);
    circle(ctx, x + sx * 7 * s + 0.9 * s, y - 0.9 * s, 0.9 * s, '#fff', false);
    oval(ctx, x + sx * 12 * s, y + 5 * s, 3.6 * s, 2.2 * s, 'rgba(255,110,130,0.55)', false);
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y + 2 * s, 3.6 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

export function cloud(ctx, x, y, k) {
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  for (const [dx, dy, r] of [[0, 0, 26], [28, -10, 30], [58, 0, 24], [28, 8, 24]]) {
    ctx.moveTo(x + (dx + r) * k, y + dy * k);
    ctx.arc(x + dx * k, y + dy * k, r * k, 0, TAU);
  }
  ctx.fill();
  cuteFace(ctx, x + 28 * k, y + 2 * k, k * 0.9);
}

export function sun(ctx, x, y, r) {
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    line(ctx, x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25, x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6, '#fbbf24', 5);
  }
  circle(ctx, x, y, r, '#fde047', false);
  cuteFace(ctx, x, y, r / 18);
}

export function bunting(ctx, x0, x1, y, colors) {
  line(ctx, x0, y, x1, y, '#6b7280', 2);
  for (let x = x0, i = 0; x < x1 - 30; x += 36, i++) {
    poly(ctx, [[x + 4, y], [x + 30, y], [x + 17, y + 24]], colors[i % colors.length], false);
  }
}
