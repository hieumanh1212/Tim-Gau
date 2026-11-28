// Khung nhìn canvas: phóng to / thu nhỏ (lăn chuột, chụm 2 ngón), kéo để di chuyển, chạm để chọn.
const MIN_ZOOM_RANGE = 4; // luôn zoom được ít nhất 4 lần so với toàn cảnh
const MAX_ABS_SCALE = 3; // ...và tối thiểu tới mức nhân vật hiện to gấp 3 kích thước gốc
const TAP_SLOP = 8;
const FRICTION = 0.92; // quán tính khi vuốt: tốc độ còn lại sau mỗi ~16ms
const MIN_GLIDE_SPEED = 0.03; // px/ms – chậm hơn thì dừng
const GLIDE_WINDOW = 80; // ms – nhấc tay trong khoảng này sau lần di chuyển cuối thì mới trượt tiếp

function clampAxis(offset, size, view) {
  if (size <= view) return (view - size) / 2;
  return Math.min(0, Math.max(view - size, offset));
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export class Viewport {
  constructor(canvas, onDraw, onTap) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onDraw = onDraw;
    this.onTap = onTap;
    this.world = { w: 1, h: 1 };
    this.scale = 1;
    this.minScale = 1;
    this.maxScale = 1;
    this.ox = 0;
    this.oy = 0;
    this.vw = 0;
    this.vh = 0;
    this.dpr = 1;
    this.pending = false;
    this.pointers = new Map();
    this.moved = false;
    this.downAt = null;
    this.lastPinch = 0;
    this.pinched = false;
    this.vx = 0;
    this.vy = 0;
    this.lastMoveT = 0;
    this.glideId = 0;
    this.bind();
  }

  bind() {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => this.down(e));
    c.addEventListener('pointermove', (e) => this.move(e));
    c.addEventListener('pointerup', (e) => this.up(e));
    c.addEventListener('pointercancel', (e) => this.cancel(e));
    c.addEventListener('wheel', (e) => this.wheel(e), { passive: false });
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.vw = rect.width;
    this.vh = rect.height;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    this.minScale = Math.min(this.vw / this.world.w, this.vh / this.world.h);
    this.maxScale = Math.max(this.minScale * MIN_ZOOM_RANGE, MAX_ABS_SCALE);
    this.scale = clamp(this.scale, this.minScale, this.maxScale);
    this.clampOffset();
    this.requestDraw();
  }

  setWorld(w, h) {
    this.stopGlide();
    this.world = { w, h };
    this.resize();
    this.fit();
  }

  // Màn hình ngang: thấy toàn cảnh. Màn hình dọc (điện thoại): phủ kín chiều cao, kéo ngang để xem.
  fit() {
    const portrait = this.vh > this.vw;
    const cover = Math.max(this.vw / this.world.w, this.vh / this.world.h);
    this.scale = portrait ? Math.min(cover, this.maxScale) : this.minScale;
    this.ox = (this.vw - this.world.w * this.scale) / 2;
    this.oy = (this.vh - this.world.h * this.scale) / 2;
    this.clampOffset();
    this.requestDraw();
  }

  zoomAt(sx, sy, factor) {
    const next = clamp(this.scale * factor, this.minScale, this.maxScale);
    const k = next / this.scale;
    this.ox = sx - (sx - this.ox) * k;
    this.oy = sy - (sy - this.oy) * k;
    this.scale = next;
    this.clampOffset();
    this.requestDraw();
  }

  zoomCenter(factor) {
    this.zoomAt(this.vw / 2, this.vh / 2, factor);
  }

  clampOffset() {
    this.ox = clampAxis(this.ox, this.world.w * this.scale, this.vw);
    this.oy = clampAxis(this.oy, this.world.h * this.scale, this.vh);
  }

  // Vùng thế giới đang hiển thị trên màn hình.
  visibleRect() {
    return {
      x0: -this.ox / this.scale,
      y0: -this.oy / this.scale,
      x1: (this.vw - this.ox) / this.scale,
      y1: (this.vh - this.oy) / this.scale,
    };
  }

  toWorld(sx, sy) {
    return { x: (sx - this.ox) / this.scale, y: (sy - this.oy) / this.scale };
  }

  local(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  down(e) {
    this.canvas.setPointerCapture(e.pointerId);
    this.stopGlide();
    const p = this.local(e);
    this.pointers.set(e.pointerId, p);
    if (this.pointers.size === 1) {
      this.downAt = p;
      this.moved = false;
      this.pinched = false;
      this.lastMoveT = performance.now();
    } else {
      this.moved = true;
      this.pinched = true;
      this.lastPinch = 0;
    }
  }

  move(e) {
    const prev = this.pointers.get(e.pointerId);
    if (!prev) return;
    const p = this.local(e);
    this.pointers.set(e.pointerId, p);
    if (this.pointers.size >= 2) {
      this.pinch();
      return;
    }
    this.trackVelocity(p.x - prev.x, p.y - prev.y);
    this.pan(p.x - prev.x, p.y - prev.y);
    if (Math.hypot(p.x - this.downAt.x, p.y - this.downAt.y) > TAP_SLOP) this.moved = true;
  }

  trackVelocity(dx, dy) {
    const now = performance.now();
    const dt = Math.max(1, now - this.lastMoveT);
    this.vx = dx / dt;
    this.vy = dy / dt;
    this.lastMoveT = now;
  }

  shouldGlide() {
    return this.pointers.size === 0 && !this.pinched && performance.now() - this.lastMoveT < GLIDE_WINDOW;
  }

  // Vuốt rồi thả tay: bản đồ trượt tiếp và chậm dần (giống cuộn trang trên điện thoại).
  glide() {
    let last = performance.now();
    const step = (now) => {
      const dt = now - last;
      last = now;
      this.pan(this.vx * dt, this.vy * dt);
      const f = FRICTION ** (dt / 16);
      this.vx *= f;
      this.vy *= f;
      this.glideId = Math.hypot(this.vx, this.vy) > MIN_GLIDE_SPEED ? requestAnimationFrame(step) : 0;
    };
    this.glideId = requestAnimationFrame(step);
  }

  stopGlide() {
    cancelAnimationFrame(this.glideId);
    this.glideId = 0;
  }

  pinch() {
    const [a, b] = [...this.pointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (this.lastPinch > 0) this.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, dist / this.lastPinch);
    this.lastPinch = dist;
  }

  pan(dx, dy) {
    this.ox += dx;
    this.oy += dy;
    this.clampOffset();
    this.requestDraw();
  }

  up(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    const isTap = this.pointers.size === 1 && !this.moved;
    this.pointers.delete(e.pointerId);
    this.lastPinch = 0;
    if (isTap) {
      const w = this.toWorld(p.x, p.y);
      this.onTap(w.x, w.y);
      return;
    }
    if (this.shouldGlide()) this.glide();
  }

  cancel(e) {
    this.pointers.delete(e.pointerId);
    this.lastPinch = 0;
  }

  wheel(e) {
    e.preventDefault();
    const p = this.local(e);
    this.zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0015));
  }

  requestDraw() {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => this.frame());
  }

  frame() {
    this.pending = false;
    const { ctx, dpr } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#cfe8b8';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(dpr * this.scale, 0, 0, dpr * this.scale, dpr * this.ox, dpr * this.oy);
    this.onDraw(ctx, this);
  }
}
