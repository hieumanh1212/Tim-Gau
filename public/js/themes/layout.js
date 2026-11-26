// Xếp đồ vật (cây, ghế, kệ hàng...) lên lưới ô. Ô đã có đồ vật thì không đặt nhân vật.
const CELLS_PER_UNIQUE = 600; // đồ vật hiếm (đài phun nước...) được thêm 1 cái mỗi ~600 ô

export function makeGrid(cols, rows, budget) {
  return { cols, rows, occ: new Uint8Array(cols * rows), budget };
}

function fits(grid, c, r, w, h) {
  if (c + w > grid.cols || r + h > grid.rows) return false;
  for (let y = r; y < r + h; y++) {
    for (let x = c; x < c + w; x++) {
      if (grid.occ[y * grid.cols + x]) return false;
    }
  }
  return true;
}

function occupy(grid, c, r, w, h) {
  for (let y = r; y < r + h; y++) {
    for (let x = c; x < c + w; x++) grid.occ[y * grid.cols + x] = 1;
  }
  grid.budget -= w * h;
}

export function tryPlace(grid, spec, c, r, v) {
  const area = spec.w * spec.h;
  if (area > grid.budget || !fits(grid, c, r, spec.w, spec.h)) return null;
  occupy(grid, c, r, spec.w, spec.h);
  return { type: spec.type, c, r, w: spec.w, h: spec.h, v };
}

function pickWeighted(rnd, specs) {
  const total = specs.reduce((s, x) => s + x.weight, 0);
  let t = rnd() * total;
  for (const spec of specs) {
    t -= spec.weight;
    if (t <= 0) return spec;
  }
  return specs[specs.length - 1];
}

function limitOf(grid, spec) {
  return spec.max ? spec.max * Math.ceil((grid.cols * grid.rows) / CELLS_PER_UNIQUE) : Infinity;
}

// Rải ngẫu nhiên các đồ vật theo trọng số cho tới khi hết "ngân sách" ô.
export function scatterProps(rnd, grid, specs) {
  const props = [];
  const counts = {};
  const tries = grid.cols * grid.rows;
  for (let i = 0; i < tries && grid.budget > 0; i++) {
    const spec = pickWeighted(rnd, specs);
    const c = Math.floor(rnd() * grid.cols);
    const r = Math.floor(rnd() * grid.rows);
    const v = rnd();
    const used = counts[spec.type] || 0;
    const p = used < limitOf(grid, spec) ? tryPlace(grid, spec, c, r, v) : null;
    if (!p) continue;
    props.push(p);
    counts[spec.type] = used + 1;
  }
  return props;
}

export function freeCells(grid) {
  const cells = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (!grid.occ[r * grid.cols + c]) cells.push({ r, c });
    }
  }
  return cells;
}
