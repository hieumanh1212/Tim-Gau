import { buildScene, hitTest, LEVELS } from './scene.js';
import { TARGET_SPECS } from './characters.js';
import { drawScene, createSceneCache, drawRing, drawCross, drawHint, drawPortrait, markerOf, drawBubble, drawConfetti } from './render.js';
import { randomOf, missLine, EMPTY_LINES, FOUND_LINES, OPP_FOUND_LINES, START_LINES, WIN_TITLES, PARTY } from './quips.js';
import { Viewport } from './view.js';
import { Net } from './net.js';
import { randomSeed } from './rng.js';
import { loadSprites } from './sprites.js';
import { THEMES } from './themes/index.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const NAMES = { bubu: 'Bubu', dudu: 'Dudu' };
const COLORS = { me: '#16a34a', opp: '#f97316' };
const HINT_PENALTY = 10000;
const MISS_LOCK = 800;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const state = {
  mode: 'solo',
  level: 'easy',
  theme: 'random',
  screen: 'menu',
  scene: null,
  cache: null,
  found: { bubu: null, dudu: null },
  pending: new Set(),
  effects: [],
  hint: null,
  startTime: 0,
  endTime: 0,
  penalty: 0,
  lockUntil: 0,
  net: null,
  room: '',
  myId: null,
  hostId: null,
  players: [],
  round: 0,
  totalRounds: 0,
  sprites: { bubu: [], dudu: [] },
};

const view = new Viewport($('#board'), drawBoard, onTap);
let timerId = null;
let toastTimer = null;

// Ảnh Bubu/Dudu tải nền; mọi lần dựng màn chơi đều chờ xong bước này (để 2 máy online giống nhau).
const spritesReady = loadSprites('assets').then((sprites) => {
  state.sprites = sprites;
  drawMenuPortraits();
});

// ---------- Tiện ích ----------
function load(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* bỏ qua khi trình duyệt chặn storage */
  }
}

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function genCode() {
  return Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
}

function serverUrl() {
  const cfg = window.TIM_GAU_CONFIG?.serverUrl;
  if (cfg) return cfg.replace(/\/$/, '');
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  return local ? 'ws://localhost:8787' : '';
}

function playerName() {
  const name = $('#name').value.trim() || 'Gấu con';
  save('tg-name', name);
  return name;
}

const allFound = () => Boolean(state.found.bubu && state.found.dudu);
const findTarget = (t) => state.scene.chars.find((c) => c.target === t);
const isHost = () => state.hostId === state.myId;

// ---------- Giao diện chung ----------
function showScreen(id) {
  $$('.screen').forEach((el) => el.classList.toggle('active', el.id === id));
  state.screen = id;
  if (id === 'game') view.resize();
}

function toast(text, ms = 1600) {
  const el = $('#toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function makeAction(action) {
  const btn = document.createElement('button');
  btn.textContent = action.label;
  if (action.primary) btn.className = 'primary';
  btn.addEventListener('click', () => {
    hideModal();
    action.fn?.();
  });
  return btn;
}

function showModal(title, text, actions) {
  $('#modal-title').textContent = title;
  $('#modal-text').textContent = text;
  $('#modal-actions').replaceChildren(...actions.map(makeAction));
  $('#modal').classList.remove('hidden');
}

function hideModal() {
  $('#modal').classList.add('hidden');
}

function setLevel(level) {
  state.level = level;
  $$('.lv').forEach((b) => b.classList.toggle('active', b.dataset.level === level));
  save('tg-level', level);
}

function setTheme(theme) {
  state.theme = theme;
  $$('.th').forEach((b) => b.classList.toggle('active', b.dataset.theme === theme));
  save('tg-theme', theme);
}

const themeLabel = () => {
  const t = THEMES[state.scene?.theme];
  return t ? `${t.icon} ${t.name}` : '';
};

// ---------- HUD ----------
function startTimer() {
  stopTimer();
  timerId = setInterval(updateTime, 250);
  updateTime();
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function elapsed() {
  const end = state.endTime || Date.now();
  return end - state.startTime + state.penalty;
}

function updateTime() {
  $('#hud-time').textContent = fmtTime(elapsed());
}

function updateHud() {
  const online = state.mode === 'online';
  const info = online ? `Ván ${state.round}/${state.totalRounds}` : `Mức ${LEVELS[state.level].label}`;
  $('#hud-round').textContent = `${info} · ${themeLabel()}`;
  $('#btn-hint').hidden = online;
  renderScores();
}

function scoreChip(p) {
  const el = document.createElement('span');
  el.className = `chip ${p.id === state.myId ? 'me' : 'opp'}`;
  el.textContent = `${p.name}: ${p.score}`;
  return el;
}

function renderScores() {
  const box = $('#hud-scores');
  const chips = state.mode === 'online' ? state.players.map(scoreChip) : [];
  box.replaceChildren(...chips);
}

function randomPortraitSpec(target) {
  const list = state.sprites[target];
  if (!list.length) return TARGET_SPECS[target];
  return { ...TARGET_SPECS[target], sprite: list[Math.floor(Math.random() * list.length)] };
}

function drawMenuPortraits() {
  $$('.refs canvas.portrait').forEach((cv) => drawPortrait(cv, randomPortraitSpec(cv.dataset.target)));
}

// Thẻ trên HUD hiển thị đúng ảnh Bubu/Dudu của ván hiện tại.
function drawRoundPortraits() {
  $$('.tcard canvas').forEach((cv) => drawPortrait(cv, findTarget(cv.dataset.target)));
}

function updateTargetCards() {
  $$('.tcard').forEach((el) => {
    const who = state.found[el.dataset.target];
    el.classList.toggle('found-me', who === 'me');
    el.classList.toggle('found-opp', who === 'opp');
  });
}

// ---------- Vẽ bảng chơi ----------
// Zoom xa: dán ảnh đệm. Zoom gần (ảnh đệm bị mờ): vẽ nét, chỉ những con trong màn hình.
function drawSceneLayer(ctx, v) {
  const { scene, cache } = state;
  const sharpEnough = cache && v.scale * v.dpr <= cache.scale * 1.25;
  if (sharpEnough) ctx.drawImage(cache.canvas, 0, 0, scene.width, scene.height);
  else drawScene(ctx, scene, v.visibleRect());
}

function drawBoard(ctx, v) {
  if (!state.scene) return;
  drawSceneLayer(ctx, v);
  const hinting = drawHintLayer(ctx);
  drawFound(ctx);
  const animating = drawEffects(ctx);
  if (hinting || animating) view.requestDraw();
}

function drawHintLayer(ctx) {
  if (!state.hint) return false;
  if (Date.now() > state.hint.until) {
    state.hint = null;
    return false;
  }
  drawHint(ctx, state.hint);
  return true;
}

function drawFound(ctx) {
  for (const [target, who] of Object.entries(state.found)) {
    if (!who) continue;
    const m = markerOf(findTarget(target));
    drawRing(ctx, m.x, m.y, ringRadius(m.r), COLORS[who]);
  }
}

// Vòng đánh dấu luôn to tối thiểu ~18px trên màn hình, kể cả khi xem toàn cảnh 3000 con.
const ringRadius = (r) => Math.max(r, 18 / view.scale);

function drawEffects(ctx) {
  const now = Date.now();
  state.effects = state.effects.filter((e) => now - e.t0 < e.dur);
  for (const e of state.effects) drawEffect(ctx, e, (now - e.t0) / e.dur);
  return state.effects.length > 0;
}

const EFFECT_DRAW = {
  miss: (ctx, e, k) => drawCross(ctx, e.x, e.y, e.size, 1 - k),
  ring: (ctx, e, k) => drawRing(ctx, e.x, e.y, e.r * (1 + k * 1.5), e.color, 1 - k),
  bubble: (ctx, e, k) => drawBubble(ctx, e.x, e.y, e.text, view.scale, k),
  confetti: (ctx, e, k) => drawConfetti(ctx, e, (k * e.dur) / 1000, view.scale, 1 - k),
};

function drawEffect(ctx, e, k) {
  EFFECT_DRAW[e.type]?.(ctx, e, k);
}

// Bong bóng thoại phía trên đầu nhân vật.
function bubbleEffect(c, text, now) {
  return { type: 'bubble', x: c.x, y: c.y - c.s * 0.62, text, t0: now, dur: 1600 };
}

function confettiEffect(x, y, now) {
  const parts = Array.from({ length: 28 }, () => ({
    vx: (Math.random() - 0.5) * 460,
    vy: -160 - Math.random() * 340,
    color: randomOf(PARTY),
    rot: Math.random() * 6,
    spin: (Math.random() - 0.5) * 12,
  }));
  return { type: 'confetti', x, y, parts, t0: now, dur: 1300 };
}

// ---------- Xử lý chạm ----------
function onTap(wx, wy) {
  const blocked = !state.scene || allFound() || Date.now() < state.lockUntil;
  if (blocked) return;
  const hit = hitTest(state.scene, wx, wy);
  if (!hit?.target) {
    onMiss(wx, wy, hit);
    return;
  }
  if (!state.found[hit.target]) onCorrect(hit.target);
}

// Bấm nhầm: bạn thú bị bấm sẽ "cãi" bằng bong bóng thoại; bấm vào chỗ trống thì hiện thông báo.
function onMiss(x, y, hit) {
  const now = Date.now();
  state.lockUntil = now + MISS_LOCK;
  state.effects.push({ type: 'miss', x, y, size: 14 / view.scale, t0: now, dur: MISS_LOCK });
  if (hit) state.effects.push(bubbleEffect(hit, missLine(hit), now));
  else toast(randomOf(EMPTY_LINES), 1000);
  navigator.vibrate?.(80);
  view.requestDraw();
}

function onCorrect(target) {
  if (state.mode === 'online') {
    claimOnline(target);
    return;
  }
  markFound(target, 'me');
  toast(`Tìm thấy ${NAMES[target]}! 🎉`);
  if (allFound()) finishSolo();
}

function markFound(target, who) {
  state.found[target] = who;
  const c = findTarget(target);
  const m = markerOf(c);
  const now = Date.now();
  const line = who === 'me' ? randomOf(FOUND_LINES) : randomOf(OPP_FOUND_LINES);
  state.effects.push(
    { type: 'ring', x: m.x, y: m.y, r: ringRadius(m.r), color: COLORS[who], t0: now, dur: 700 },
    confettiEffect(m.x, m.y, now),
    bubbleEffect(c, line, now),
  );
  updateTargetCards();
  view.requestDraw();
}

// ---------- Chơi một mình ----------
async function startScene(seed, level, theme) {
  await spritesReady;
  await document.fonts?.ready; // để chữ trên biển hiệu vẽ đúng font
  state.scene = buildScene(seed, level, state.sprites, theme);
  state.cache = createSceneCache(state.scene);
  drawRoundPortraits();
  state.found = { bubu: null, dudu: null };
  state.pending.clear();
  state.effects = [];
  state.hint = null;
  state.lockUntil = 0;
  state.penalty = 0;
  state.endTime = 0;
  state.startTime = Date.now();
  view.setWorld(state.scene.width, state.scene.height);
  updateTargetCards();
  updateHud();
  startTimer();
}

async function startSolo() {
  state.mode = 'solo';
  showScreen('game');
  await startScene(randomSeed(), state.level, state.theme);
  toast(`${themeLabel()} – ${randomOf(START_LINES)}`, 2200);
}

function finishSolo() {
  state.endTime = Date.now();
  stopTimer();
  updateTime();
  const ms = elapsed();
  const key = `tg-best-${state.level}`;
  const best = Number(load(key, 0));
  const isBest = !best || ms < best;
  if (isBest) save(key, String(ms));
  const record = isBest ? 'Kỷ lục mới! 🏆' : `Kỷ lục: ${fmtTime(best)}`;
  const actions = [
    { label: 'Chơi lại', primary: true, fn: startSolo },
    { label: 'Về menu', fn: goMenu },
  ];
  setTimeout(() => showModal(randomOf(WIN_TITLES), `Thời gian: ${fmtTime(ms)}\n${record}`, actions), 1200);
}

function useHint() {
  if (state.mode !== 'solo' || !state.scene || allFound()) return;
  const c = findTarget(state.found.bubu ? 'dudu' : 'bubu');
  const r = Math.min(state.scene.width, state.scene.height) * 0.15;
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * r * 0.6;
  state.hint = { x: c.x + Math.cos(angle) * dist, y: c.y + Math.sin(angle) * dist, r, until: Date.now() + 3500 };
  state.penalty += HINT_PENALTY;
  updateTime();
  toast('Gợi ý: +10 giây ⏱️');
  view.requestDraw();
}

function goMenu() {
  stopTimer();
  hideModal();
  state.mode = 'solo';
  showScreen('menu');
}

function quitGame() {
  if (state.mode === 'online') leaveRoom();
  else goMenu();
}

// ---------- Chơi online ----------
const NET_HANDLERS = {
  welcome: (m) => {
    state.myId = m.you;
  },
  room: onRoom,
  round: onRound,
  claimed: onClaimed,
  roundEnd: onRoundEnd,
  gameOver: onGameOver,
  aborted: onAborted,
  error: onServerError,
};

async function connectRoom(code) {
  const base = serverUrl();
  if (!base) {
    showModal('Chưa cấu hình máy chủ', 'Hãy điền serverUrl trong file config.js (xem README).', [{ label: 'OK' }]);
    return;
  }
  state.net?.close();
  const net = new Net(`${base}/room/${code}`);
  net.onMessage = (m) => NET_HANDLERS[m.t]?.(m);
  net.onClose = onNetClose;
  Object.assign(state, { net, room: code, mode: 'online', players: [], myId: null, hostId: null });
  try {
    await net.connect();
  } catch {
    Object.assign(state, { net: null, mode: 'solo' });
    showModal('Không kết nối được', 'Không kết nối được máy chủ socket. Thử lại sau nhé.', [{ label: 'OK' }]);
    return;
  }
  net.send({ t: 'hello', name: playerName() });
  history.replaceState(null, '', `?room=${code}`);
  renderLobby();
  showScreen('lobby');
}

function joinRoom() {
  const code = $('#room-code').value.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,8}$/.test(code)) {
    toast('Mã phòng gồm 4–8 chữ/số');
    return;
  }
  connectRoom(code);
}

function leaveRoom() {
  state.net?.close();
  state.net = null;
  state.room = '';
  history.replaceState(null, '', location.pathname);
  goMenu();
}

function onNetClose() {
  state.net = null;
  stopTimer();
  showModal('Mất kết nối', 'Kết nối tới máy chủ bị gián đoạn.', [{ label: 'Về menu', fn: leaveRoom }]);
}

function onServerError(m) {
  if (!m.fatal) {
    toast(m.msg, 2500);
    return;
  }
  state.net?.close();
  state.net = null;
  showModal('Không vào được phòng', m.msg, [{ label: 'OK', fn: leaveRoom }]);
}

function lobbyStatus() {
  if (state.players.length < 2) return 'Đang chờ người chơi thứ 2… Gửi link mời cho bạn nhé!';
  return isHost() ? 'Đủ người rồi! Chọn mức độ rồi bấm Bắt đầu.' : 'Chờ chủ phòng bắt đầu…';
}

function lobbyItem(p) {
  const li = document.createElement('li');
  const host = p.id === state.hostId ? ' 👑' : '';
  const me = p.id === state.myId ? ' (bạn)' : '';
  li.textContent = `${p.name}${host}${me}`;
  return li;
}

function renderLobby() {
  $('#lobby-code').textContent = state.room;
  $('#lobby-players').replaceChildren(...state.players.map(lobbyItem));
  $('#lobby-status').textContent = lobbyStatus();
  $('#btn-start').hidden = !isHost();
  $('#btn-start').disabled = state.players.length < 2;
  $('#lobby-levels').hidden = !isHost();
}

async function copyInvite() {
  const link = `${location.origin}${location.pathname}?room=${state.room}`;
  try {
    await navigator.clipboard.writeText(link);
    toast('Đã sao chép link mời!');
  } catch {
    window.prompt('Sao chép link này gửi cho bạn:', link);
  }
}

function startOnline() {
  state.net?.send({ t: 'start', level: state.level, theme: state.theme });
}

function claimOnline(target) {
  if (state.pending.has(target)) return;
  state.pending.add(target);
  state.net?.send({ t: 'claim', round: state.round, target });
}

function onRoom(m) {
  state.players = m.players;
  state.hostId = m.host;
  renderLobby();
  renderScores();
}

async function onRound(m) {
  Object.assign(state, { mode: 'online', round: m.round, totalRounds: m.total, level: m.level });
  hideModal();
  showScreen('game');
  await startScene(m.seed, m.level, m.theme);
  toast(`Ván ${m.round}/${m.total} · ${themeLabel()}`);
}

function nameOf(id) {
  return state.players.find((p) => p.id === id)?.name ?? 'Đối thủ';
}

function onClaimed(m) {
  if (m.round !== state.round) return;
  state.pending.delete(m.target);
  state.players = m.players;
  renderScores();
  const mine = m.by === state.myId;
  markFound(m.target, mine ? 'me' : 'opp');
  toast(mine ? `Bạn tìm thấy ${NAMES[m.target]}! +1` : `${nameOf(m.by)} tìm thấy ${NAMES[m.target]} trước!`);
}

function onRoundEnd(m) {
  state.endTime = Date.now();
  stopTimer();
  if (m.round < m.total) setTimeout(() => toast('Ván tiếp theo sắp bắt đầu…', 2000), 1500);
}

function resultTitle(ranked) {
  const [a, b] = ranked;
  if (!b || a.score === b.score) return 'Hoà rồi! 🤝';
  return a.id === state.myId ? 'Bạn thắng! 🏆' : `${a.name} thắng!`;
}

function onGameOver(m) {
  state.players = m.players;
  renderScores();
  const ranked = [...m.players].sort((x, y) => y.score - x.score);
  const text = ranked.map((p) => `${p.name}: ${p.score} điểm`).join('\n');
  const actions = [
    { label: 'Về phòng chờ', fn: () => showScreen('lobby') },
    { label: 'Thoát phòng', fn: leaveRoom },
  ];
  if (isHost()) actions.unshift({ label: 'Chơi lại', primary: true, fn: startOnline });
  setTimeout(() => showModal(resultTitle(ranked), text, actions), 900);
}

function onAborted() {
  stopTimer();
  showModal('Đối thủ đã rời phòng', 'Ván đấu bị huỷ. Chờ người khác vào phòng nhé.', [
    { label: 'Về phòng chờ', fn: () => showScreen('lobby') },
  ]);
}

// ---------- Khởi động ----------
function bindUi() {
  const on = (sel, fn) => $(sel).addEventListener('click', fn);
  $$('.lv').forEach((b) => b.addEventListener('click', () => setLevel(b.dataset.level)));
  $$('.th').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.theme)));
  on('#btn-solo', startSolo);
  on('#btn-create', () => connectRoom(genCode()));
  on('#btn-join', joinRoom);
  on('#btn-copy', copyInvite);
  on('#btn-start', startOnline);
  on('#btn-leave', leaveRoom);
  on('#btn-quit', quitGame);
  on('#btn-hint', useHint);
  on('#zoom-in', () => view.zoomCenter(1.4));
  on('#zoom-out', () => view.zoomCenter(1 / 1.4));
  on('#zoom-fit', () => view.fit());
  $('#room-code').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinRoom();
  });
}

// Nút chọn bối cảnh sinh từ danh sách THEMES (thêm bối cảnh mới là tự có nút).
function themeButton(key, icon, name) {
  const b = document.createElement('button');
  b.className = 'th';
  b.dataset.theme = key;
  b.innerHTML = `<span>${icon}</span><small>${name}</small>`;
  return b;
}

function renderThemePickers() {
  const items = [['random', '🎲', 'Ngẫu nhiên'], ...Object.values(THEMES).map((t) => [t.key, t.icon, t.name])];
  $$('.themes').forEach((box) => box.replaceChildren(...items.map((it) => themeButton(...it))));
}

function init() {
  $$('canvas.portrait').forEach((cv) => drawPortrait(cv, TARGET_SPECS[cv.dataset.target]));
  $('#name').value = load('tg-name', '');
  const savedLevel = load('tg-level', 'easy');
  setLevel(LEVELS[savedLevel] ? savedLevel : 'easy');
  renderThemePickers();
  const savedTheme = load('tg-theme', 'random');
  setTheme(THEMES[savedTheme] ? savedTheme : 'random');
  bindUi();
  const room = new URLSearchParams(location.search).get('room');
  if (room) $('#room-code').value = room.toUpperCase();
  if (!serverUrl()) $('#online-note').textContent = 'Chế độ online cần máy chủ socket – điền serverUrl trong config.js.';
}

init();
