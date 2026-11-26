// Kết nối WebSocket tới server phòng chơi (Cloudflare Worker + Durable Object).
const PING_MS = 25000;

export class Net {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.opened = false;
    this.closedByUser = false;
    this.pingTimer = null;
    this.onMessage = () => {};
    this.onClose = () => {};
  }

  connect() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.ws = ws;
      ws.onopen = () => {
        this.opened = true;
        this.pingTimer = setInterval(() => this.send({ t: 'ping' }), PING_MS);
        resolve();
      };
      ws.onerror = () => reject(new Error('Không kết nối được máy chủ'));
      ws.onmessage = (ev) => this.handle(ev.data);
      ws.onclose = () => this.closed();
    });
  }

  handle(raw) {
    try {
      this.onMessage(JSON.parse(raw));
    } catch (err) {
      console.error('Tin nhắn lỗi', err);
    }
  }

  closed() {
    clearInterval(this.pingTimer);
    if (this.opened && !this.closedByUser) this.onClose();
  }

  send(obj) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }

  close() {
    this.closedByUser = true;
    clearInterval(this.pingTimer);
    this.ws?.close();
  }
}
