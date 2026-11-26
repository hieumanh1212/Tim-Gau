# 🐻 Tìm Bubu & Dudu

Game tìm hình: giữa 500 / 1000 / 3000 bạn thú, hãy chạm đúng **Bubu (gấu trắng)** và **Dudu (gấu nâu)**.
Gấu đội mũ, đeo nơ, đeo kính, quàng khăn, gấu khác màu, mèo/thỏ/chó cùng màu… đều là **đồ giả**.

- **Chơi một mình**: tính giờ, lưu kỷ lục theo từng mức, có nút gợi ý 💡 (+10 giây).
- **Chơi online 2 người**: tạo phòng → gửi link mời → 5 ván, ai chạm trúng Bubu/Dudu trước được +1 điểm.
  Hai người thấy **cùng một bức hình** (server chỉ gửi `seed`, mỗi máy tự sinh hình giống hệt nhau).
- Điều khiển: lăn chuột / chụm 2 ngón để zoom, kéo để di chuyển, chạm/click để chọn. Chọn sai sẽ bị khoá 0,8 giây.

## Ảnh Bubu / Dudu của bạn

Bỏ ảnh vào 2 thư mục cùng cấp với `public/` (bao nhiêu ảnh cũng được, tên file tuỳ ý):

```
tim-gau/bubu/   ← các ảnh Bubu
tim-gau/dudu/   ← các ảnh Dudu
```

Sau đó chạy:

```bash
node scripts/gen-manifest.mjs
```

Script chép ảnh sang `public/assets/bubu|dudu` (đổi tên thành `001.jpg`, `002.png`…) và tạo `public/assets/manifest.json`.
Các file này được sinh tự động nên đã nằm trong `.gitignore`. Chỉ cần commit ảnh gốc ở `bubu/` và `dudu/`.

- Mỗi ván, game **random 1 ảnh Bubu và 1 ảnh Dudu** làm "hàng thật". Thẻ trên thanh HUD hiện đúng ảnh của ván đó.
- Mỗi màn chỉ có **đúng 1 Bubu và 1 Dudu** dùng ảnh thật, còn lại là các bạn thú vẽ bằng code.
- Ảnh **nền trắng / nền một màu** (JPG cũng được): game tự xoá nền bằng cách loang từ mép ảnh vào, nên thân trắng của Bubu (có viền đen) vẫn giữ nguyên.
  Ảnh **PNG nền trong suốt** thì dùng thẳng. Ảnh **có cảnh nền nhiều màu** (tường, cây…) không xoá được nền, sẽ hiện thành ô vuông.
  Bấm trúng chỉ tính khi chạm vào phần có hình, không tính phần nền đã xoá.
- Chưa có ảnh trong thư mục nào thì nhân vật đó dùng hình gấu vẽ bằng code.
- GitHub Actions tự chạy `gen-manifest.mjs` khi deploy. Khi chạy local, bạn tự chạy lệnh trên mỗi lần thêm/xoá ảnh.
- Chơi online: ảnh được chọn theo `seed` nên 2 người thấy giống hệt nhau, miễn là cả hai mở cùng một bản deploy.

## Cấu trúc

```
tim-gau/
├─ bubu/, dudu/            # Ảnh gốc của bạn
├─ scripts/gen-manifest.mjs  # Chép ảnh vào public/assets + tạo manifest
├─ public/                 # Web tĩnh (deploy lên GitHub Pages / Cloudflare Pages)
│  ├─ index.html, style.css
│  ├─ config.js            # <- điền URL server socket ở đây
│  └─ js/
│     ├─ main.js           # luồng game, UI, online
│     ├─ scene.js          # sinh bức hình theo seed + mức độ
│     ├─ characters.js     # vẽ nhân vật (Canvas), định nghĩa Bubu/Dudu và đồ giả
│     ├─ render.js, view.js, net.js, rng.js
├─ server/                 # Máy chủ WebSocket (Cloudflare Workers + Durable Objects)
│  ├─ worker.js
│  └─ wrangler.toml
└─ .github/workflows/pages.yml   # Tự deploy public/ lên GitHub Pages
```

> Vì sao cần server riêng? GitHub Pages / Cloudflare Pages chỉ host file tĩnh, không giữ được kết nối socket.
> Phần socket chạy trên **Cloudflare Workers + Durable Objects** (gói miễn phí dùng được).

---

## 1. Chạy thử trên máy

Cần Node.js 18+.

**Windows: double-click `start.bat`**. File này chép ảnh, bật server socket, bật web và tự mở trình duyệt tại `http://localhost:3000`.

Hoặc gõ lệnh thủ công:

```bash
# Terminal 1 – web
npx serve public            # mở http://localhost:3000

# Terminal 2 – server socket (cho chế độ online)
cd server
npm install
npm run dev                 # ws://localhost:8787
```

Khi chạy ở `localhost`, game tự dùng `ws://localhost:8787` nên không cần sửa `config.js`.
Mở 2 tab trình duyệt: tab 1 **Tạo phòng**, tab 2 nhập mã phòng → **Vào phòng**.

> Không mở trực tiếp file `index.html` bằng double-click (file://) vì trình duyệt chặn ES module – hãy dùng `npx serve`.

---

## 2. Deploy server socket lên Cloudflare Workers

```bash
cd server
npm install
npx wrangler login          # đăng nhập tài khoản Cloudflare (miễn phí)
npm run deploy
```

Wrangler sẽ in ra URL dạng `https://tim-gau-server.<ten-ban>.workers.dev`.
Mở `public/config.js` và điền (đổi `https` → `wss`):

```js
window.TIM_GAU_CONFIG = {
  serverUrl: 'wss://tim-gau-server.<ten-ban>.workers.dev',
};
```

Kiểm tra nhanh: mở `https://tim-gau-server.<ten-ban>.workers.dev` trên trình duyệt sẽ thấy `Tim Gau socket server: OK`.

---

## 3. Publish lên GitHub Pages

```bash
cd tim-gau
git init
git add .
git commit -m "Tim Bubu & Dudu"
git branch -M main
git remote add origin https://github.com/<user>/tim-gau.git
git push -u origin main
```

Trên GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Workflow `.github/workflows/pages.yml` sẽ tự chạy mỗi lần push lên `main`.
Game có ở: `https://<user>.github.io/tim-gau/`

---

## 4. Publish lên Cloudflare Pages

**Cách A – nối với GitHub (tự deploy mỗi lần push):**
1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Chọn repo `tim-gau`.
3. Framework preset: **None** · Build command: **`node scripts/gen-manifest.mjs`** · Build output directory: **`public`**.
4. Save and Deploy → có link `https://tim-gau.pages.dev`.

**Cách B – deploy thẳng từ máy:**

```bash
node scripts/gen-manifest.mjs
npx wrangler pages deploy public --project-name tim-gau
```

Có thể dùng **cả GitHub Pages và Cloudflare Pages cùng lúc** – cả hai đều trỏ về cùng một server socket.

---

## Tuỳ chỉnh

- **Bối cảnh** (🌳 Công viên, 🛒 Siêu thị, 🏖️ Bãi biển, 🏙️ Phố đi bộ, 🎡 Khu vui chơi, 🏫 Trường học, 🦁 Sở thú,
  🌾 Nông trại, 🏕️ Cắm trại, ❄️ Xứ tuyết, 🚀 Vũ trụ): mỗi bối cảnh là 1 file trong `public/js/themes/`.
  Muốn thêm bối cảnh mới: copy `park.js`, đổi `key`/`name`/`icon`, vẽ lại `band` (dải cảnh phía trên), `ground` (nền), danh sách đồ vật `SPECS`,
  rồi đăng ký trong `themes/index.js` (nút chọn tự xuất hiện). `propShare` = tỉ lệ ô dành cho đồ vật.

- **Số ván, thời gian chờ giữa ván**: `MAX_ROUNDS`, `NEXT_ROUND_DELAY` trong `server/worker.js`.
- **Số nhân vật, tỉ lệ đồ giả "khó"**: `LEVELS` trong `public/js/scene.js`.
- **Màu Bubu / Dudu, thêm loại đồ giả**: `TARGET_SPECS`, `NEAR_COLORS`, `ACCESSORIES` trong `public/js/characters.js`.
  (Nếu muốn đổi: Bubu là gấu nâu, Dudu là gấu trắng – chỉ cần đổi `body`/`muzzle` trong `TARGET_SPECS`.)
