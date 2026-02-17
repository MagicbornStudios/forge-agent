import { EventEmitter } from 'node:events';
import { createInterface } from 'node:readline';

export class CodexProtocolClient extends EventEmitter {
  constructor(childProcess) {
    super();
    this.process = childProcess;
    this.nextId = 1;
    this.pending = new Map();
    this.readlineStdout = createInterface({ input: childProcess.stdout });
    this.readlineStderr = createInterface({ input: childProcess.stderr });

    this.readlineStdout.on('line', (line) => this.#handleLine(line));
    this.readlineStderr.on('line', (line) => {
      const text = String(line || '').trim();
      if (text) this.emit('stderr', text);
    });

    this.process.on('exit', () => {
      this.#rejectPending('Codex app-server exited.');
      this.emit('exit');
    });
  }

  #rejectPending(reason) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(reason));
    }
    this.pending.clear();
  }

  #handleLine(line) {
    const raw = String(line || '').trim();
    if (!raw) return;

    let message;
    try {
      message = JSON.parse(raw);
    } catch {
      this.emit('diagnostic', `non-json: ${raw.slice(0, 300)}`);
      return;
    }

    if (message.id != null && (Object.prototype.hasOwnProperty.call(message, 'result') || Object.prototype.hasOwnProperty.call(message, 'error'))) {
      const key = String(message.id);
      const pending = this.pending.get(key);
      if (!pending) return;
      this.pending.delete(key);
      clearTimeout(pending.timeout);
      if (message.error) {
        pending.reject(new Error(String(message.error.message || `${pending.method} failed`)));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    if (message.method) {
      this.emit('notification', message);
      return;
    }

    this.emit('diagnostic', `unknown-message: ${raw.slice(0, 300)}`);
  }

  request(method, params = {}, timeoutMs = 45000) {
    const id = String(this.nextId++);
    const payload = { id, method, params };
    this.process.stdin.write(`${JSON.stringify(payload)}\n`);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pending.set(id, {
        method,
        resolve,
        reject,
        timeout,
      });
    });
  }

  notify(method, params = {}) {
    this.process.stdin.write(`${JSON.stringify({ method, params })}\n`);
  }

  async initialize({ clientName = 'forge-loop', clientVersion = '1.0.0' } = {}) {
    await this.request('initialize', {
      protocolVersion: 1,
      clientInfo: {
        name: clientName,
        version: clientVersion,
      },
    });

    this.notify('initialized', {});
  }

  async startThread() {
    return this.request('thread/start', {});
  }

  async startTurn({ threadId, cwd, model, prompt, metadata = {} }) {
    return this.request('turn/start', {
      threadId,
      cwd,
      model,
      input: [{ type: 'text', text: prompt }],
      prompt,
      metadata,
    }, 60000);
  }

  async close() {
    this.#rejectPending('Codex protocol client closed.');
    this.readlineStdout.close();
    this.readlineStderr.close();
  }
}
