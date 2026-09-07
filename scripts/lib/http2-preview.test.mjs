import assert from 'node:assert/strict';
import http from 'node:http';
import http2 from 'node:http2';
import { gzipSync } from 'node:zlib';
import { test } from 'node:test';
import { startHttp2Preview } from './http2-preview.mjs';

test('HTTP/2 audit proxy preserves response bytes, status, and cache headers', async () => {
  const body = gzipSync(Buffer.from('<!doctype html><title>unchanged publication</title>'));
  const upstream = http.createServer((request, response) => {
    assert.equal(request.url, '/missing?query=kept');
    response.writeHead(404, {
      'content-type': 'text/html; charset=utf-8', 'content-encoding': 'gzip',
      'content-length': body.length, 'cache-control': 'public, max-age=60',
    });
    response.end(body);
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  let preview, client;
  try {
    preview = await startHttp2Preview(upstream.address().port);
    client = http2.connect(preview.origin, { rejectUnauthorized: false });
    const request = client.request({ ':path': '/missing?query=kept' });
    const chunks = [];
    let headers;
    await new Promise((resolve, reject) => {
      request.on('response', value => { headers = value; });
      request.on('data', chunk => chunks.push(chunk));
      request.on('end', resolve);
      request.on('error', reject);
      request.end();
    });
    assert.equal(client.alpnProtocol, 'h2');
    assert.equal(headers[':status'], 404);
    assert.equal(headers['content-type'], 'text/html; charset=utf-8');
    assert.equal(headers['content-encoding'], 'gzip');
    assert.equal(headers['cache-control'], 'public, max-age=60');
    assert.equal(Number(headers['content-length']), body.length);
    assert.deepEqual(Buffer.concat(chunks), body);
  } finally {
    client?.destroy();
    await preview?.close();
    await new Promise(resolve => upstream.close(resolve));
  }
});
