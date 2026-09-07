import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { startHttp2Preview, requireHttp2 } from './lib/http2-preview.mjs';

const output = process.env.ASCII_QA_DIR || path.join(os.tmpdir(), 'ascii-homepage-qa');
await mkdir(output, { recursive: true });
const baseline = process.argv[2];
if (!baseline) throw Error('Pass a built baseline checkout path');
const revision = cwd => execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
const htmlDigest = async cwd => createHash('sha256').update(await readFile(path.join(cwd, 'dist/index.html'))).digest('hex');
const reports = { provenance: {
  measuredAt: new Date().toISOString(),
  baseline: revision(path.resolve(baseline)), candidate: revision(process.cwd()),
  baselineHtmlSha256: await htmlDigest(path.resolve(baseline)), candidateHtmlSha256: await htmlDigest(process.cwd()),
  node: process.version, platform: process.platform, browser: chromium.executablePath(),
  profile: 'Lighthouse default cold mobile simulation over HTTP/2; three runs per revision',
} };
const auditPreview = await startHttp2Preview(4178);
try {
for (const [label, cwd] of [['before', path.resolve(baseline)], ['after', process.cwd()]]) {
  const server = spawn(process.execPath, [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', '4178', '--strictPort'], { cwd, stdio: 'inherit' });
  const exit = once(server, 'exit');
  try {
    for (let i=0;i<50;i++) { try { if ((await fetch('http://127.0.0.1:4178/')).ok) break; } catch {} if(i===49) throw Error('preview unavailable'); await new Promise(r=>setTimeout(r,200)); }
    const runs = [];
    for (let i=1;i<=3;i++) {
      console.log(`auditing ${label} cold mobile run ${i}/3`);
      const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new','--no-sandbox','--allow-insecure-localhost'] });
      try {
        const r = await lighthouse(`${auditPreview.origin}/`, { port: chrome.port, onlyCategories: ['performance'], output: 'json', logLevel: 'silent' });
        requireHttp2(r.lhr);
        await writeFile(path.join(output, `${label}-lighthouse-${i}.json`), r.report);
        const a = r.lhr.audits;
        runs.push({ score: r.lhr.categories.performance.score * 100, fcp: a['first-contentful-paint'].numericValue, lcp: a['largest-contentful-paint'].numericValue, tbt: a['total-blocking-time'].numericValue, cls: a['cumulative-layout-shift'].numericValue, bytes: a['total-byte-weight'].numericValue });
      } finally { await chrome.kill(); }
    }
    reports[label] = { runs, median: Object.fromEntries(Object.keys(runs[0]).map(k=>[k,runs.map(r=>r[k]).sort((a,b)=>a-b)[1]])) };
    if (label === 'after') {
      const browser = await chromium.launch();
      try {
        const page = await browser.newPage({viewport:{width:1440,height:900}}); await page.goto('http://127.0.0.1:4178/');
        await page.waitForFunction(()=>document.querySelector('.ascii-background')?.dataset.motion==='running');
        const worker = page.workers()[0];
        await worker.evaluate(() => {
          self.frameCosts = [];
          const original = self.setTimeout.bind(self);
          self.setTimeout = (fn, delay, ...args) => original(() => { const start=performance.now(); fn(...args); self.frameCosts.push(performance.now()-start); }, delay);
        });
        const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
        const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
        const start = await metrics(); await page.waitForTimeout(10000); const end=await metrics();
        const costs=await worker.evaluate(()=>self.frameCosts);
        if (!costs.length || costs.some(cost => !Number.isFinite(cost))) throw Error('worker timing sample is empty or invalid');
        costs.sort((a,b)=>a-b);
        reports.runtime={ seconds:10,frames:costs.length,workerFrameP50Ms:costs[Math.floor(costs.length*.5)],workerFrameP95Ms:costs[Math.floor(costs.length*.95)],mainThreadTaskMs:(end.TaskDuration-start.TaskDuration)*1000 };
      } finally {await browser.close();}
    }
  } finally { server.kill('SIGTERM'); await exit; }
}
// Keep the existing absolute gates. A baseline miss is context, never a waiver.
const budgetFailures = ({ score, tbt, cls }) => [
  ...(score < 99 ? [`performance score ${score} is below 99`] : []),
  ...(tbt >= 100 ? [`TBT ${tbt}ms is not below 100ms`] : []),
  ...(cls >= .05 ? [`CLS ${cls} is not below 0.05`] : []),
];
reports.budget = {
  baselineFailures: budgetFailures(reports.before.median),
  candidateFailures: budgetFailures(reports.after.median),
  workerFailures: reports.runtime.workerFrameP95Ms > 16 ? ['worker frame p95 exceeds 16ms'] : [],
};
reports.delta = Object.fromEntries(Object.keys(reports.after.median).map(key => [key, reports.after.median[key] - reports.before.median[key]]));
await writeFile(path.join(output,'performance.json'),JSON.stringify(reports,null,2));
console.log(JSON.stringify(reports,null,2));
if (reports.budget.candidateFailures.length || reports.budget.workerFailures.length) {
  const baselineContext = reports.budget.baselineFailures.length
    ? `Unchanged baseline also misses the absolute budget: ${reports.budget.baselineFailures.join('; ')}. This alone does not establish an animation regression.`
    : 'Unchanged baseline meets the absolute homepage budget.';
  throw Error(`Homepage budget failed: ${[...reports.budget.candidateFailures, ...reports.budget.workerFailures].join('; ')}. ${baselineContext}`);
}

} finally { await auditPreview.close(); }
