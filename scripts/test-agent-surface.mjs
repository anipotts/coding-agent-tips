import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';
import { AGENT_TOOL_NAMES, AGENT_TOOL_SCHEMAS, createHandbookTools } from '../src/agent-contract.mjs';
import { buildAgentIndex, normalizePublicText, sectionIndex, splitCanonicalMarkdown } from '../src/agent-index.mjs';
import { buildAgentCatalog } from '../src/agent-catalog.mjs';
import { AGENT_INDEX_VERSION, AGENT_CATALOG_VERSION } from '../src/agent-index-version.mjs';
import { canonicalContentFiles } from '../src/content-manifest.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const index = JSON.parse(await readFile(path.join(dist, 'agent-index.json'), 'utf8'));
const catalog = JSON.parse(await readFile(path.join(dist, 'agent-catalog.json'), 'utf8'));
assert.equal(index.schemaVersion, AGENT_INDEX_VERSION, 'legacy full index must retain its schema');
assert.equal(catalog.schemaVersion, AGENT_CATALOG_VERSION);
assert.deepEqual(catalog, await buildAgentCatalog(root));
assert.deepEqual(catalog.pages.map((page) => page.route), index.pages.map((page) => page.route));
assert.ok(catalog.pages.every((page) => !Object.hasOwn(page, 'text') && page.sections.every((section) => !Object.hasOwn(section, 'text'))), 'catalog must contain metadata and headings without page text');
const pageChunks = new Map();
for (const page of catalog.pages) {
  const chunk = JSON.parse(await readFile(path.join(dist, page.contentUrl.replace(/^\//, '')), 'utf8'));
  assert.equal(chunk.schemaVersion, AGENT_CATALOG_VERSION);
  assert.deepEqual(chunk.page, index.pages.find((candidate) => candidate.route === page.route), 'page chunk must preserve every field and full text from the legacy index');
  pageChunks.set(page.route, chunk.page);
}
assert.equal(normalizePublicText('&amp;lt;script&amp;gt;'), '&lt;script&gt;', 'entity decoding must remain single pass');
assert.equal(normalizePublicText('&amp;amp;lt;'), '&amp;lt;', 'nested ampersand entities must decode by exactly one level');
assert.notEqual(normalizePublicText('&amp;amp;lt;'), '&lt;', 'nested ampersand entities must never decode twice');
const htmlHeadingFixture = sectionIndex('```html\n<h2 id="example-only">example only</h2>\n```\n\n<div><h2 id="real-timeline-entry">the real entry</h2><p>the event and its source.</p></div>');
assert.deepEqual(htmlHeadingFixture.sections.map((section) => section.anchor), ['real-timeline-entry'], 'HTML heading indexing must exclude fenced examples');
assert.equal(htmlHeadingFixture.sections[0].text, 'the event and its source.');
const explicitHeadingFixture = sectionIndex('<h2 id="custom">duplicate</h2>\n\n## duplicate\n\nvisible body');
assert.deepEqual(explicitHeadingFixture.sections.map((section) => section.anchor), ['custom', 'duplicate'], 'explicit HTML ids must not consume Markdown slug counters');
const commentedHeadingFixture = sectionIndex('<!-- <h2 id="ghost">ghost</h2> -->\n\n<div><!-- <h2 id="nested-ghost">ghost</h2> --><h2 id="visible">visible</h2><p>visible body</p></div>');
assert.deepEqual(commentedHeadingFixture.sections.map((section) => section.anchor), ['visible'], 'HTML comments must not contribute sections');
assert.deepEqual(index, await buildAgentIndex(root), 'built agent index must exactly match canonical content');
process.chdir(path.dirname(root));
assert.deepEqual(index, await buildAgentIndex(root), 'explicit-root generation must be independent of caller cwd');
process.chdir(root);
assert.deepEqual(index.pages.map(({ route }) => route), canonicalContentFiles().map(({ route }) => route).sort((a, b) => a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
assert.equal(index.discovery.llms, '/llms.txt');
assert.equal(index.discovery.index, '/agent-index.json');
assert.ok(index.pages.every((page) => page.text && page.sections.every((section) => section.anchor && section.title)));
assert.ok(index.sources.every((source) => Object.keys(source).sort().join(',') === 'evidence,id,publisher,title,url'));
assert.ok(index.sources.every((source) => Object.keys(source.publisher ?? {}).sort().join(',') === 'domain,id,label'));
assert.ok(index.pages.flatMap((page) => page.sourceIds).every((id) => index.sources.some((source) => source.id === id)));
const homeSource = await readFile(path.join(root, 'content/home.md'), 'utf8');
assert.equal(await readFile(path.join(dist, 'index.md'), 'utf8'), `${splitCanonicalMarkdown(homeSource).body.trim()}\n`, 'homepage Markdown endpoint must preserve canonical text');

const navigated = [];
const tools = createHandbookTools({ loadIndex: async () => index, navigate: async (target) => navigated.push(target) });
assert.deepEqual(tools.map(({ name }) => name), AGENT_TOOL_NAMES);
for (const name of AGENT_TOOL_NAMES) assert.equal(AGENT_TOOL_SCHEMAS[name].additionalProperties, false, `${name} schema must reject extra properties`);
assert.equal((await tools[0].execute({ scope: 'codex', limit: 2 })).data.pages.length, 2);
assert.equal((await tools[0].execute({ unexpected: true })).error.code, 'invalid_input');
const search = await tools[1].execute({ query: 'codex', limit: 3 });
assert.equal(search.ok, true);
assert.deepEqual(search, await tools[1].execute({ query: 'codex', limit: 3 }), 'search ordering must be deterministic');
assert.equal((await tools[1].execute({ query: '', limit: 3 })).error.code, 'invalid_input');
const longSection = index.pages.find((page) => page.route === '/guides/codex/').sections.find((section) => section.text.length > 250);
assert.ok(longSection, 'Codex must expose a substantive section for bounded reading');
const sectionResult = await tools[2].execute({ route: '/guides/codex/', anchor: longSection.anchor, maxCharacters: 250 });
assert.equal(sectionResult.ok, true);
assert.equal(sectionResult.data.section.text.length, 250);
assert.equal(sectionResult.data.section.truncated, true);
assert.equal((await tools[2].execute({ route: '/guides/codex/', anchor: 'missing' })).error.code, 'not_found');
const knownSourceId = index.pages.find((page) => page.route === '/guides/codex/').sourceIds[0];
const source = await tools[3].execute({ sourceId: knownSourceId });
assert.equal(source.ok, true);
assert.deepEqual(Object.keys(source.data.source).sort(), ['evidence', 'id', 'publisher', 'title', 'url']);
assert.equal((await tools[3].execute({ sourceId: 'private-or-unknown' })).error.code, 'not_found');
assert.equal((await tools[4].execute({ route: 'https://example.com/' })).error.code, 'navigation_rejected');
assert.equal((await tools[4].execute({ route: '//example.com/' })).error.code, 'navigation_rejected');
assert.equal((await tools[4].execute({ route: '/guides/codex/', anchor: 'missing' })).error.code, 'navigation_rejected');
assert.equal((await tools[4].execute({ route: '/guides/codex/', anchor: 'this-is-codex' })).ok, true);
assert.deepEqual(navigated, ['/guides/codex/#this-is-codex']);

const loadedPages = [];
const progressiveTools = createHandbookTools({
  loadIndex: async () => catalog,
  loadPage: async (page) => { loadedPages.push(page.route); return pageChunks.get(page.route); },
  navigate: async () => {},
});
assert.deepEqual(await progressiveTools[0].execute({ scope: 'codex', limit: 2 }), await tools[0].execute({ scope: 'codex', limit: 2 }));
assert.deepEqual(await progressiveTools[3].execute({ sourceId: knownSourceId }), source);
assert.equal((await progressiveTools[4].execute({ route: '/guides/codex/', anchor: 'this-is-codex' })).ok, true);
assert.deepEqual(loadedPages, [], 'listing, source inspection and navigation must use only the catalog');
assert.deepEqual(await progressiveTools[2].execute({ route: '/guides/codex/', anchor: longSection.anchor, maxCharacters: 250 }), sectionResult);
assert.deepEqual(loadedPages, ['/guides/codex/'], 'section reading must load only its page');
loadedPages.length = 0;
const scopedQuery = { query: 'permissions', scope: 'codex', limit: 8 };
assert.deepEqual(await progressiveTools[1].execute(scopedQuery), await tools[1].execute(scopedQuery), 'scoped search must preserve full legacy results');
assert.deepEqual(loadedPages, catalog.pages.filter((page) => page.scope === 'codex').map((page) => page.route), 'scoped search must not load unrelated page text');
assert.deepEqual(await progressiveTools[1].execute({ query: 'browser', limit: 8 }), await tools[1].execute({ query: 'browser', limit: 8 }), 'unscoped search must preserve full legacy content and ranking');
const unavailableTools = createHandbookTools({ loadIndex: async () => catalog, loadPage: async () => { throw new Error('offline'); }, navigate: async () => {} });
assert.equal((await unavailableTools[2].execute({ route: '/guides/codex/', anchor: longSection.anchor })).error.code, 'unavailable');
for (const [toolIndex, input] of [[1, scopedQuery], [2, { route: '/guides/codex/', anchor: longSection.anchor }]]) {
  const controller = new AbortController();
  const cancelledTools = createHandbookTools({
    loadIndex: async () => catalog,
    loadPage: async (page) => { queueMicrotask(() => controller.abort()); return pageChunks.get(page.route); },
    navigate: async () => {},
  });
  assert.equal((await cancelledTools[toolIndex].execute(input, { signal: controller.signal })).error.code, 'aborted', 'cancellation during a cached page read must not return success');
}
const indexController = new AbortController();
const cancelledIndexTools = createHandbookTools({
  loadIndex: async () => { queueMicrotask(() => indexController.abort()); return catalog; },
  navigate: async () => assert.fail('cancelled index loading must prevent navigation'),
});
assert.equal((await cancelledIndexTools[4].execute({ route: '/guides/codex/' }, { signal: indexController.signal })).error.code, 'aborted');
const historySource = await readFile(path.join(root, 'content/handbook/history.md'), 'utf8');
const timelineAnchor = historySource.match(/<h2\s+id="([^"]+)"/)?.[1];
assert.ok(timelineAnchor, 'history timeline must expose stable heading ids');
const historySection = await progressiveTools[2].execute({ route: '/handbook/history/', anchor: timelineAnchor });
assert.equal(historySection.ok, true, 'first HTML timeline section must be readable');
assert.ok(historySection.data.section.text.length > 0);
assert.equal((await progressiveTools[4].execute({ route: '/handbook/history/', anchor: timelineAnchor })).data.target, `/handbook/history/#${timelineAnchor}`);

const port = 4178;
const origin = `http://127.0.0.1:${port}`;
const vite = path.join(root, 'node_modules/vite/bin/vite.js');
const server = spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'inherit' });
const serverExit = once(server, 'exit');
let browser;

try {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(origin)).ok) break; } catch {}
    if (attempt === 39) throw new Error('preview did not become ready');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  browser = await chromium.launch({ headless: true });
  const supported = await browser.newContext();
  await supported.addInitScript(() => {
    const active = new Map();
    const calls = [];
    let maximumActive = 0;
    const context = {
      async registerTool(tool, options = {}) {
        if (active.has(tool.name)) throw new Error(`duplicate tool: ${tool.name}`);
        active.set(tool.name, tool);
        calls.push(tool.name);
        maximumActive = Math.max(maximumActive, active.size);
        options.signal?.addEventListener('abort', () => active.delete(tool.name), { once: true });
      },
    };
    Object.defineProperty(Document.prototype, 'modelContext', { configurable: true, get: () => context });
    window.__webmcpTest = {
      activeNames: () => [...active.keys()],
      callCount: () => calls.length,
      maximumActive: () => maximumActive,
      execute: (name, input) => active.get(name).execute(input),
    };
    window.__agentDocumentToken = crypto.randomUUID();
  });
  const page = await supported.newPage();
  const errors = [];
  const agentRequests = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith('/agent-')) agentRequests.push(pathname);
  });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}/guides/codex/`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__webmcpTest?.activeNames().length === 5);
  assert.deepEqual(await page.evaluate(() => window.__webmcpTest.activeNames()), AGENT_TOOL_NAMES);
  assert.deepEqual(agentRequests, [], 'agent data must remain unloaded until a tool is called');
  await page.evaluate(() => window.__webmcpTest.execute('list_handbook_pages', { scope: 'codex' }));
  assert.deepEqual(agentRequests, ['/agent-catalog.json'], 'metadata calls must fetch only the compact catalog');
  await page.evaluate((anchor) => window.__webmcpTest.execute('read_handbook_section', { route: '/guides/codex/', anchor }), longSection.anchor);
  await page.evaluate((anchor) => window.__webmcpTest.execute('read_handbook_section', { route: '/guides/codex/', anchor }), longSection.anchor);
  assert.deepEqual(agentRequests, ['/agent-catalog.json', '/agent-pages/guides/codex.json'], 'repeated section reads must reuse the page cache');
  const token = await page.evaluate(() => window.__agentDocumentToken);
  await page.evaluate(() => window.__webmcpTest.execute('open_handbook_page', { route: '/guides/codex/configuration/' }));
  await page.waitForURL('**/guides/codex/configuration/');
  await page.waitForFunction(() => window.__webmcpTest?.callCount() === 10 && window.__webmcpTest.activeNames().length === 5);
  assert.equal(await page.evaluate(() => window.__agentDocumentToken), token, 'WebMCP navigation must preserve ClientRouter document continuity');
  assert.equal(await page.evaluate(() => window.__webmcpTest.maximumActive()), 5, 'registrations must abort before replacement');
  assert.deepEqual(await page.evaluate(() => window.__webmcpTest.activeNames()), AGENT_TOOL_NAMES);
  assert.deepEqual(errors, []);
  // ClientRouter announces its destination separately from the public page copy.
  const publicText = async (target) => (await target.locator('body').innerText()).replace(
    (await target.locator('.astro-route-announcer').allTextContents()).join(''), ''
  ).replace(/\s+/g, ' ').trim();
  const supportedText = await publicText(page);
  await supported.close();

  const unsupported = await browser.newContext();
  const fallbackPage = await unsupported.newPage();
  const fallbackErrors = [];
  fallbackPage.on('console', (message) => { if (message.type() === 'error') fallbackErrors.push(message.text()); });
  fallbackPage.on('pageerror', (error) => fallbackErrors.push(error.message));
  await fallbackPage.goto(`${origin}/guides/codex/configuration/`, { waitUntil: 'networkidle' });
  assert.equal(await fallbackPage.evaluate(() => document.modelContext), undefined);
  assert.equal(await fallbackPage.locator('[data-webmcp], webmcp').count(), 0, 'agent surface must render no visible UI');
  assert.equal(await publicText(fallbackPage), supportedText, 'WebMCP support must not alter public text');
  assert.deepEqual(fallbackErrors, []);
  await unsupported.close();

  const noJavaScript = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJavaScript.newPage();
  await staticPage.goto(`${origin}/`, { waitUntil: 'load' });
  const href = await staticPage.locator('a[href="/guides/codex/"]').first().getAttribute('href');
  assert.equal(href, '/guides/codex/');
  await staticPage.goto(`${origin}${href}`, { waitUntil: 'load' });
  assert.equal(new URL(staticPage.url()).pathname, '/guides/codex/');
  assert.equal((await staticPage.request.get(`${origin}/agent-index.json`)).status(), 200);
  await noJavaScript.close();
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  await Promise.race([serverExit, new Promise((resolve) => setTimeout(resolve, 2000))]);
}

console.log(`validated ${index.pages.length} indexed pages, ${index.sources.length} public sources, five bounded tools, and progressive WebMCP lifecycle behavior`);
