// Chép ảnh từ tim-gau/bubu và tim-gau/dudu vào public/assets/{bubu,dudu} (đổi tên gọn: 001.jpg, 002.png...)
// và ghi danh sách vào public/assets/manifest.json.
// Chạy lại mỗi khi thêm/xoá ảnh:  node scripts/gen-manifest.mjs
import { readdirSync, writeFileSync, existsSync, rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'public', 'assets');
const IMAGE_EXT = /\.(png|webp|gif|jpe?g)$/i;
const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true });

function syncFolder(folder) {
  const src = join(root, folder);
  const dst = join(assets, folder);
  rmSync(dst, { recursive: true, force: true });
  mkdirSync(dst, { recursive: true });
  const files = existsSync(src) ? readdirSync(src).filter((f) => IMAGE_EXT.test(f)).sort(byName) : [];
  return files.map((file, i) => {
    const name = `${String(i + 1).padStart(3, '0')}${extname(file).toLowerCase()}`;
    copyFileSync(join(src, file), join(dst, name));
    return name;
  });
}

const manifest = { bubu: syncFolder('bubu'), dudu: syncFolder('dudu') };
writeFileSync(join(assets, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Đã chép: bubu ${manifest.bubu.length} ảnh, dudu ${manifest.dudu.length} ảnh`);
