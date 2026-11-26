// Tải ảnh Bubu / Dudu từ public/assets/bubu, public/assets/dudu (danh sách trong assets/manifest.json).
// Mỗi ảnh được cắt bỏ viền trong suốt và lưu mặt nạ alpha để bấm trúng chính xác theo hình.
const MAX_SIDE = 320;
const ALPHA_MIN = 24;
const BG_TOLERANCE = 60;
const EMPTY = { bubu: [], dudu: [] };

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function fetchManifest(url) {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    return res.ok ? await res.json() : EMPTY;
  } catch {
    return EMPTY;
  }
}

// ---------- Xoá nền (ảnh JPG nền trắng / nền một màu) ----------
function colorDist(d, i, ref) {
  const p = i * 4;
  return Math.abs(d[p] - ref[0]) + Math.abs(d[p + 1] - ref[1]) + Math.abs(d[p + 2] - ref[2]);
}

// Màu nền = màu của 1 góc mà ít nhất 3/4 góc giống nó. Ảnh đã trong suốt hoặc nền nhiều màu => null.
function backgroundColor(d, w, h) {
  const corners = [0, w - 1, (h - 1) * w, h * w - 1];
  if (corners.some((i) => d[i * 4 + 3] < 250)) return null;
  for (const c of corners) {
    const ref = [d[c * 4], d[c * 4 + 1], d[c * 4 + 2]];
    const similar = corners.filter((i) => colorDist(d, i, ref) < BG_TOLERANCE).length;
    if (similar >= 3) return ref;
  }
  return null;
}

function borderIndexes(w, h) {
  const out = [];
  for (let x = 0; x < w; x++) out.push(x, (h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) out.push(y * w, y * w + w - 1);
  return out;
}

function pushNeighbors(stack, i, w, h) {
  const x = i % w;
  if (x > 0) stack.push(i - 1);
  if (x < w - 1) stack.push(i + 1);
  if (i >= w) stack.push(i - w);
  if (i < w * (h - 1)) stack.push(i + w);
}

// Loang từ mép ảnh vào, xoá các điểm gần màu nền. Nhân vật có viền đậm nên phần thân trắng không bị ăn mất.
function removeBackground(d, w, h) {
  const ref = backgroundColor(d, w, h);
  if (!ref) return;
  const seen = new Uint8Array(w * h);
  const stack = borderIndexes(w, h);
  while (stack.length) {
    const i = stack.pop();
    if (seen[i]) continue;
    seen[i] = 1;
    if (colorDist(d, i, ref) >= BG_TOLERANCE) continue;
    d[i * 4 + 3] = 0;
    pushNeighbors(stack, i, w, h);
  }
}

function opaqueBox(data, w, h) {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] <= ALPHA_MIN) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w, h };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function alphaMask(data, fullW, box) {
  const mask = new Uint8Array(box.w * box.h);
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      mask[y * box.w + x] = data[((y + box.y) * fullW + (x + box.x)) * 4 + 3];
    }
  }
  return mask;
}

async function loadSprite(url, id) {
  const img = await loadImage(url);
  if (!img) return null;
  const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * k));
  const h = Math.max(1, Math.round(img.naturalHeight * k));
  const full = makeCanvas(w, h);
  const fctx = full.getContext('2d', { willReadFrequently: true });
  fctx.drawImage(img, 0, 0, w, h);
  const imageData = fctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  removeBackground(data, w, h);
  fctx.putImageData(imageData, 0, 0);
  const box = opaqueBox(data, w, h);
  const canvas = makeCanvas(box.w, box.h);
  canvas.getContext('2d').drawImage(full, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
  return { id, canvas, w: box.w, h: box.h, mask: alphaMask(data, w, box) };
}

async function loadGroup(base, folder, files) {
  const list = Array.isArray(files) ? files : [];
  const sprites = await Promise.all(
    list.map((f, i) => loadSprite(`${base}/${folder}/${encodeURIComponent(f)}`, `${folder}-${i}`)),
  );
  return sprites.filter(Boolean);
}

export async function loadSprites(base = 'assets') {
  const manifest = await fetchManifest(`${base}/manifest.json`);
  const [bubu, dudu] = await Promise.all([
    loadGroup(base, 'bubu', manifest.bubu),
    loadGroup(base, 'dudu', manifest.dudu),
  ]);
  return { bubu, dudu };
}

// Khung vẽ ảnh trong toạ độ cục bộ nhân vật (rộng tối đa 0.85, cao tối đa 0.95, chạm đất ở y = 0.48).
export function spriteBox(sprite) {
  const k = Math.min(0.85 / sprite.w, 0.95 / sprite.h);
  const w = sprite.w * k;
  const h = sprite.h * k;
  return { x: -w / 2, y: 0.48 - h, w, h };
}

export function spriteHit(sprite, lx, ly) {
  const b = spriteBox(sprite);
  const px = Math.floor(((lx - b.x) / b.w) * sprite.w);
  const py = Math.floor(((ly - b.y) / b.h) * sprite.h);
  const inside = px >= 0 && py >= 0 && px < sprite.w && py < sprite.h;
  return inside && sprite.mask[py * sprite.w + px] > ALPHA_MIN;
}
