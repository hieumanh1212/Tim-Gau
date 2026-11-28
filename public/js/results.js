// Phần hình minh hoạ trong bảng kết quả: ảnh Bubu/Dudu của ván + ai tìm ra, hoặc bảng điểm cuối trận.
import { drawPortrait } from './render.js';

const NAMES = { bubu: 'Bubu', dudu: 'Dudu' };

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// who: 'me' (viền xanh) | 'opp' (viền cam); finder: tên hiện trên nhãn (bỏ trống khi chơi một mình).
function targetTile(spec, target, who, finder) {
  const tile = el('div', `res-tile ${who || ''}`);
  const cv = el('canvas');
  cv.width = 192;
  cv.height = 192;
  drawPortrait(cv, spec);
  tile.append(cv, el('b', '', NAMES[target]));
  if (finder) tile.append(el('span', 'res-chip', finder));
  return tile;
}

// specs = { bubu, dudu } (nhân vật của ván), found = { bubu: 'me'|'opp', ... }, names = { me, opp } hoặc null.
export function targetsArt(specs, found, names = null) {
  const row = el('div', 'res-row');
  for (const t of ['bubu', 'dudu']) row.append(targetTile(specs[t], t, found[t], names?.[found[t]]));
  return row;
}

function scoreTile(p, mine, winner) {
  const tile = el('div', `res-tile ${mine ? 'me' : 'opp'}`);
  tile.append(
    el('div', 'res-crown', winner ? '👑' : '🐾'),
    el('div', 'res-score', String(p.score)),
    el('b', '', p.name),
    el('span', 'res-chip', mine ? 'Bạn' : 'Đối thủ'),
  );
  return tile;
}

// Bảng điểm cuối trận: người thắng có vương miện.
export function scoreArt(ranked, myId) {
  const row = el('div', 'res-row');
  const tie = ranked.length < 2 || ranked[0].score === ranked[1].score;
  ranked.forEach((p, i) => row.append(scoreTile(p, p.id === myId, !tie && i === 0)));
  return row;
}

// Thêm dòng "Ván sau sắp bắt đầu..." (dấu chấm nhảy) bên dưới.
export function withFooter(node, text) {
  const box = el('div');
  box.append(node, el('p', 'res-next', text));
  return box;
}
