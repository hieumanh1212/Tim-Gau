// Máy chủ socket cho "Tìm Bubu & Dudu".
// Mỗi phòng = 1 Durable Object, giữ tối đa 2 kết nối WebSocket và làm trọng tài: ai bấm trước được điểm.
import { DurableObject } from 'cloudflare:workers';

const MAX_PLAYERS = 2;
const MAX_ROUNDS = 5;
const NEXT_ROUND_DELAY = 3500;
const LEVELS = new Set(['easy', 'medium', 'hard']);
const TARGETS = new Set(['bubu', 'dudu']);
const ROOM_PATH = /^\/room\/([A-Za-z0-9]{4,8})$/;
const THEME_KEY = /^[a-z]{1,16}$/; // tên bối cảnh do client định nghĩa; 'random' => client tự chọn theo seed

export default {
  async fetch(request, env) {
    const match = new URL(request.url).pathname.match(ROOM_PATH);
    if (!match) return new Response('Tim Gau socket server: OK');
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    const id = env.ROOMS.idFromName(match[1].toUpperCase());
    return env.ROOMS.get(id).fetch(request);
  },
};

const send = (ws, msg) => {
  try {
    ws.send(JSON.stringify(msg));
  } catch {
    /* socket đã đóng */
  }
};

function parse(raw) {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const cleanName = (name) => String(name ?? '').trim().slice(0, 16) || 'Gấu con';

const HANDLERS = {
  hello: (room, player, msg) => room.setName(player, msg.name),
  start: (room, player, msg) => room.start(player, msg.level, msg.theme),
  claim: (room, player, msg) => room.claim(player, msg),
  ping: () => {},
};

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.players = new Map();
    this.hostId = null;
    this.game = null;
    this.timer = null;
  }

  async fetch() {
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();
    this.join(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  join(ws) {
    if (this.players.size >= MAX_PLAYERS) {
      send(ws, { t: 'error', fatal: true, msg: 'Phòng đã đủ 2 người chơi.' });
      ws.close(1008, 'Room full');
      return;
    }
    const player = { id: crypto.randomUUID().slice(0, 8), ws, name: 'Gấu con', score: 0 };
    this.players.set(player.id, player);
    this.hostId ??= player.id;
    ws.addEventListener('message', (ev) => this.onMessage(player, ev.data));
    ws.addEventListener('close', () => this.leave(player));
    ws.addEventListener('error', () => this.leave(player));
    send(ws, { t: 'welcome', you: player.id });
    this.broadcastRoom();
  }

  onMessage(player, raw) {
    const msg = parse(raw);
    const handler = msg && HANDLERS[msg.t];
    if (handler) handler(this, player, msg);
  }

  setName(player, name) {
    player.name = cleanName(name);
    this.broadcastRoom();
  }

  start(player, level, theme) {
    if (player.id !== this.hostId) {
      send(player.ws, { t: 'error', msg: 'Chỉ chủ phòng mới bắt đầu được.' });
      return;
    }
    if (this.players.size < MAX_PLAYERS) {
      send(player.ws, { t: 'error', msg: 'Cần đủ 2 người chơi.' });
      return;
    }
    this.clearTimer();
    for (const p of this.players.values()) p.score = 0;
    this.game = {
      level: LEVELS.has(level) ? level : 'easy',
      theme: THEME_KEY.test(String(theme)) ? theme : 'random',
      round: 0,
      claimed: {},
    };
    this.nextRound();
  }

  nextRound() {
    const game = this.game;
    if (!game) return;
    game.round += 1;
    game.claimed = {};
    this.broadcast({
      t: 'round',
      round: game.round,
      total: MAX_ROUNDS,
      level: game.level,
      theme: game.theme,
      seed: Math.floor(Math.random() * 2 ** 31),
    });
  }

  claim(player, msg) {
    const game = this.game;
    const valid = game && msg.round === game.round && TARGETS.has(msg.target) && !game.claimed[msg.target];
    if (!valid) return;
    game.claimed[msg.target] = player.id;
    player.score += 1;
    this.broadcast({ t: 'claimed', round: game.round, target: msg.target, by: player.id, players: this.playerList() });
    if (Object.keys(game.claimed).length === TARGETS.size) this.endRound();
  }

  endRound() {
    const game = this.game;
    this.broadcast({ t: 'roundEnd', round: game.round, total: MAX_ROUNDS, players: this.playerList() });
    if (game.round < MAX_ROUNDS) {
      this.timer = setTimeout(() => this.nextRound(), NEXT_ROUND_DELAY);
      return;
    }
    this.game = null;
    this.broadcast({ t: 'gameOver', players: this.playerList() });
    this.broadcastRoom();
  }

  leave(player) {
    if (!this.players.delete(player.id)) return;
    if (this.hostId === player.id) this.hostId = this.players.keys().next().value ?? null;
    if (this.game) {
      this.game = null;
      this.clearTimer();
      this.broadcast({ t: 'aborted' });
    }
    this.broadcastRoom();
  }

  clearTimer() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  playerList() {
    return [...this.players.values()].map(({ id, name, score }) => ({ id, name, score }));
  }

  broadcastRoom() {
    this.broadcast({ t: 'room', host: this.hostId, players: this.playerList(), playing: Boolean(this.game) });
  }

  broadcast(msg) {
    for (const p of this.players.values()) send(p.ws, msg);
  }
}
