// Cấu hình máy chủ socket cho chế độ chơi online 2 người.
// Sau khi deploy thư mục server/ lên Cloudflare Workers, dán URL vào đây (đổi https:// thành wss://).
// Ví dụ: serverUrl: 'wss://tim-gau-server.ten-ban.workers.dev'
// Để trống: khi chạy ở localhost sẽ tự dùng ws://localhost:8787 (wrangler dev).
window.TIM_GAU_CONFIG = {
  serverUrl: '',
};
