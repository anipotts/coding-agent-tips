import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { buildEditorialInventory } from '../../scripts/lib/editorial-inventory.mjs';

// Read-only development middleware. No routes, assets, or ledger ship in dist.
export default function editorialProgress() {
  return {
    name: 'editorial-progress', apply: 'serve', enforce: 'pre',
    configureServer(server) {
      const root = server.config.root, clients = new Set();
      let snapshot, pending, timer, dirty = true;
      async function current() {
        if (snapshot && !dirty) return snapshot;
        if (pending) return pending;
        dirty = false;
        pending = buildEditorialInventory(root).then(value => snapshot = value).catch(error => { dirty = true; throw error; }).finally(() => { pending = null; });
        return pending;
      }
      const send = (event, value) => { for (const client of clients) client.write(`event: ${event}\ndata: ${JSON.stringify(value)}\n\n`); };
      const changed = file => {
        const relative = path.relative(root, file);
        if (!/^(content\/|editorial\/)/.test(relative)) return;
        dirty = true; clearTimeout(timer);
        timer = setTimeout(async () => {
          try { const data = await current(); send(relative.startsWith('editorial/progress/') ? 'reload' : 'updated', { revision: data.revision }); }
          catch { send('scan-error', { message: 'A writing file could not be read. Keeping the last snapshot until it is valid.' }); }
        }, 100);
      };
      server.watcher.add([path.join(root, 'content'), path.join(root, 'editorial')]);
      for (const event of ['add', 'change', 'unlink']) server.watcher.on(event, changed);
      const heartbeat = setInterval(() => { for (const client of clients) client.write(': connected\n\n'); }, 20000);
      server.httpServer?.once('close', () => { clearInterval(heartbeat); clearTimeout(timer); for (const client of clients) client.end(); for (const event of ['add', 'change', 'unlink']) server.watcher.off(event, changed); });
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (url.pathname !== '/__progress' && !url.pathname.startsWith('/__progress/')) return next();
        const address = request.socket.remoteAddress;
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address)) { response.writeHead(403); response.end('Local preview only'); return; }
        if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('X-Robots-Tag', 'noindex, nofollow');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        try {
          if (url.pathname === '/__progress/events') {
            response.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
            if (request.method === 'HEAD') { response.end(); return; }
            clients.add(response); response.write('event: connected\ndata: {}\n\n');
            request.on('close', () => clients.delete(response)); return;
          }
          if (url.pathname === '/__progress/data.json') {
            const data = await current(); response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(data)); return;
          }
          const assets = { '/__progress': 'index.html', '/__progress/': 'index.html', '/__progress/map.css': 'map.css', '/__progress/map.js': 'map.js' };
          const file = assets[url.pathname];
          if (!file) { response.writeHead(404); response.end('Unknown local map path'); return; }
          response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8');
          response.end(await readFile(path.join(root, 'editorial/progress', file), 'utf8'));
        } catch { response.writeHead(503, { 'Content-Type': 'application/json' }); response.end(JSON.stringify({ error: 'The current writing files could not be read. Retrying after the next save.' })); }
      });
    },
  };
}
