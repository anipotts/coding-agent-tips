import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import http from 'node:http';
import http2 from 'node:http2';
import os from 'node:os';
import path from 'node:path';

const hopHeaders = new Set(['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'http2-settings']);
const forwardedHeaders = headers => Object.fromEntries(Object.entries(headers).filter(([name]) => !name.startsWith(':') && !hopHeaders.has(name)));

/** Preserve Vite's response bytes and headers while matching the live CDN protocol. */
export async function startHttp2Preview(upstreamPort) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'handbook-audit-tls-'));
  const sessions = new Set();
  let server;
  const close = async () => {
    for (const session of sessions) session.destroy();
    if (server?.listening) await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  };
  try {
    // One-day, loopback-only test certificate; never published or stored in reports.
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes',
      '-keyout', path.join(directory, 'key.pem'), '-out', path.join(directory, 'cert.pem'),
      '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
    server = http2.createSecureServer({
      key: await readFile(path.join(directory, 'key.pem')),
      cert: await readFile(path.join(directory, 'cert.pem')),
    }, (request, response) => {
      const upstream = http.request({ hostname: '127.0.0.1', port: upstreamPort,
        path: request.url, method: request.method, headers: forwardedHeaders(request.headers) }, result => {
        response.writeHead(result.statusCode, forwardedHeaders(result.headers));
        result.pipe(response);
      });
      upstream.on('error', () => { if (!response.headersSent) response.writeHead(502); response.end(); });
      response.on('close', () => upstream.destroy());
      request.pipe(upstream);
    });
    server.on('session', session => { sessions.add(session); session.on('close', () => sessions.delete(session)); });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    return { origin: `https://127.0.0.1:${server.address().port}`, close };
  } catch (error) { await close(); throw error; }
}

export function requireHttp2(lhr) {
  const document = lhr.audits['network-requests'].details.items.find(item => item.resourceType === 'Document');
  if (document?.protocol !== 'h2') throw new Error(`Expected HTTP/2 in Lighthouse, received ${document?.protocol ?? 'no document request'}`);
}
