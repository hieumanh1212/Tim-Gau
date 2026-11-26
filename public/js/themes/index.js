// Danh sách bối cảnh. Muốn thêm bối cảnh mới: tạo file giống park.js rồi đăng ký ở đây (nút chọn tự xuất hiện).
import park from './park.js';
import market from './market.js';
import beach from './beach.js';
import city from './city.js';
import fun from './fun.js';
import school from './school.js';
import zoo from './zoo.js';
import farm from './farm.js';
import camping from './camping.js';
import snow from './snow.js';
import space from './space.js';

export const THEMES = { park, market, beach, city, fun, school, zoo, farm, camping, snow, space };
export const THEME_KEYS = Object.keys(THEMES);

// 'random' (hoặc giá trị lạ) => chọn theo seed, nên 2 người chơi online luôn ra cùng bối cảnh.
export function resolveTheme(key, seed) {
  return THEMES[key] ? key : THEME_KEYS[seed % THEME_KEYS.length];
}
