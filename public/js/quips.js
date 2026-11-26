// Câu thoại hài hước. Thoải mái thêm/sửa câu ở đây.
export const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Bạn thú "cãi" khi bị bấm nhầm (theo loài).
const MISS_BY_KIND = {
  cat: ['Meo~ tớ là mèo mà! 😼', 'Tai nhọn thế này mà!', 'Mèo nha, không phải gấu!'],
  bunny: ['Tớ là thỏ mà 🥕', 'Tai dài thế này cơ mà!', 'Thỏ con đây, hihi'],
  dog: ['Gâu! Tớ là cún 🐶', 'Cún con đi lạc thôi~', 'Gâu gâu, nhầm rồi!'],
  panda: ['Tớ là gấu trúc nha 🐼', 'Có quầng mắt mà!', 'Đang ăn tre, đừng phá~'],
  pig: ['Ủn ỉn~ 🐷', 'Heo con đây!', 'Ủn ỉn, nhầm rồi nha!'],
  bear: ['Tớ khác màu mà!', 'Gấu khác nha~', 'Không phải tớ đâu!', 'Tớ chỉ đi ngang qua thôi'],
};
const MISS_ACC = ['Tớ có phụ kiện mà! 😎', 'Tớ cosplay thôi~', 'Đồ giả đây, hihi', 'Nhìn kỹ cái mũ đi!'];
const MISS_GENERIC = ['Không phải tớ!', 'Ơ kìa!', 'Nhầm rồi nha~', 'Hihi, sai rồi!', 'Bubu ở chỗ khác cơ!'];

export function missLine(c) {
  if (c.acc) return randomOf([...MISS_ACC, ...MISS_GENERIC]);
  return randomOf(MISS_BY_KIND[c.kind] || MISS_GENERIC);
}

export const EMPTY_LINES = ['Chỗ này trống trơn mà 😅', 'Ở đây chỉ có cỏ thôi~', 'Hụt rồi! 🙈', 'Bấm vào bạn gấu cơ!'];

export const FOUND_LINES = ['Bị bắt rồi! 🙈', 'Hihi, giỏi ghê!', 'Sao cậu thấy tớ?', 'Trốn kỹ vậy mà…', 'Yayyy! 🎉', 'Ò ó o~ thua rồi!'];

export const OPP_FOUND_LINES = ['Bạn kia nhanh quá! 😝', 'Hụt mất rồi~', 'Lần sau nhanh hơn nha!'];

export const START_LINES = [
  'Bubu với Dudu lại đi trốn rồi!',
  'Hai bạn gấu đang chơi trốn tìm…',
  'Bubu Dudu trốn kỹ lắm đó!',
  'Mở to mắt ra nào 👀',
];

export const WIN_TITLES = ['Mắt thần! 👀', 'Thám tử gấu nhí! 🕵️', 'Bubu Dudu chạy đâu cho thoát! 🐻', 'Đỉnh của chóp! 🏆', 'Giỏi quá trời! 🎉'];

export const PARTY = ['#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
