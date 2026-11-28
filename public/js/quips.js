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

// ---------- Kết quả mỗi ván khi chơi 2 người ({me}, {opp} = tên người chơi) ----------
const ROUND_SPLIT = {
  titles: ['Cả hai đều siêu đỉnh! 🤝✨', 'Chia đôi công bằng ghê! 🍰', 'Song kiếm hợp bích! 💕', 'Một người một bạn gấu! 🐻🐼'],
  texts: [
    'Bubu một nhà, Dudu một nhà, ai cũng có quà! 🎁',
    'Mỗi bạn bắt được một bạn gấu, hoà nhau ván này nha~ 🥰',
    'Mắt ai cũng tinh như mắt mèo luôn á! 😸',
    'Bubu Dudu bảo: "Hai bạn này đáng sợ quá đi!" 🙈',
  ],
};
const ROUND_SWEEP_ME = {
  titles: ['Bạn bắt trọn cả hai! 🐻🐻', 'Mắt thần đây rồi! 👀✨', 'Một mình cân hết! 💪😎'],
  texts: [
    'Bạn tìm ra cả Bubu lẫn Dudu rồi nè~ {opp} ơi cố lên nha! 💪',
    'Bubu Dudu trốn đâu cũng bị bạn tóm gọn! 🫶',
    '{opp} chưa kịp chớp mắt là xong rồi, hihi~ ⚡',
  ],
};
const ROUND_SWEEP_OPP = {
  titles: ['{opp} nhanh như chớp! ⚡', 'Ôi không, chậm mất rồi! 🙈', '{opp} bắt trọn cả hai! 🐻🐻'],
  texts: [
    '{opp} đã tìm ra Bubu và Dudu trước rồi… Ván sau gỡ lại nha! 🥺',
    'Bubu Dudu chạy hết sang nhà {opp} rồi kìa~ 😭',
    'Hít thở sâu, mở to mắt, ván sau là của bạn! 💪✨',
  ],
};

// ---------- Tổng kết cuối trận ----------
const GAME_TIE = {
  titles: ['Hoà nhau rồi! 🤝💕', 'Bất phân thắng bại! 🐻🤝🐼'],
  texts: ['Hai bạn đều có đôi mắt thần luôn á! ✨', 'Bubu Dudu xin thua cả hai bạn~ 🙇'],
};
const GAME_WIN = {
  titles: ['Bạn thắng rồi! 🏆🐻', 'Vô địch tìm gấu! 👑✨', 'Thám tử gấu số 1! 🕵️'],
  texts: ['Bubu Dudu trốn đâu cũng bị bạn tìm ra~ 😎', '{opp} ơi, làm ván nữa gỡ lại không? 😝'],
};
const GAME_LOSE = {
  titles: ['{opp} thắng rồi! 👑', 'Thua một xíu thôi mà! 🥺'],
  texts: ['Làm ván nữa gỡ lại nha, bạn làm được mà! 💪💕', 'Bubu Dudu nói: "Lần sau tụi tớ trốn gần bạn hơn!" 🐻'],
};

const fill = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

function pickLine(pool, vars) {
  return { title: fill(randomOf(pool.titles), vars), text: fill(randomOf(pool.texts), vars) };
}

// found = { bubu: 'me'|'opp', dudu: 'me'|'opp' }
export function roundSummary(found, opp) {
  if (found.bubu !== found.dudu) return pickLine(ROUND_SPLIT, { opp });
  return pickLine(found.bubu === 'me' ? ROUND_SWEEP_ME : ROUND_SWEEP_OPP, { opp });
}

// ranked = người chơi xếp theo điểm giảm dần
export function gameOverSummary(ranked, myId, opp) {
  const tie = ranked.length < 2 || ranked[0].score === ranked[1].score;
  if (tie) return pickLine(GAME_TIE, { opp });
  return pickLine(ranked[0].id === myId ? GAME_WIN : GAME_LOSE, { opp });
}

export const PARTY =['#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
