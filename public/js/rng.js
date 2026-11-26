// Bộ sinh số ngẫu nhiên có seed: cùng seed => cùng bức hình (dùng cho chơi online 2 người).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

export const range = (rnd, min, max) => min + rnd() * (max - min);

export function shuffle(rnd, arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 31);
