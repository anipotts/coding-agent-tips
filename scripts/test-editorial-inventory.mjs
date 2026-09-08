import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { safeUrl } from '../editorial/progress/links.js';
import assert from 'node:assert/strict';
import { canonicalContentFiles } from '../src/content-manifest.mjs';
import { resolveWritingSteps, indexWriting, inspectFeatures, applyReviewRecords, fingerprint, bodyFingerprint, buildEditorialInventory } from './lib/editorial-inventory.mjs';
const doc = body => `---\ntitle: fixture\nnavigation: { scope: handbook, order: 1 }\n---\n\n${body}`;

test('media checks can inspect drafts without adding them to public routes', () => {
 const route='/guides/codex/workflows/';
 assert.ok(!canonicalContentFiles().some(page=>page.route===route));
 assert.ok(canonicalContentFiles(process.cwd(),{includeDrafts:true}).some(page=>page.route===route));
});

test('counts authored structure and media, excluding fenced HTML and responsive alternatives',()=>{
 const p=indexWriting(doc('## section\n\n[docs][ref]\n\n<div><h3 id="history">event</h3><img src="/a.webp" srcset="/b.webp 600w" alt="image"><video poster="/poster.webp"><source src="/movie.mp4"></video></div>\n\n```html\n<h2>fake heading</h2><img src="/fake.webp">\n```\n\n[ref]: https://example.com\n'),'content/handbook/fixture.md');
 assert.deepEqual(p.sections.map(s=>s.anchor),['_top','section','history']);
 assert.equal(p.counts.images,1);assert.equal(p.counts.videos,1);assert.equal(p.counts.links,1);assert.equal(p.counts.code,1);assert.ok(p.written);
});
test('counts each example and link once rather than again in the parent',()=>{
 const p=indexWriting(doc('## parent\n\n### child\n\n<div class="example-block example-good">\n\n```text\ntry this\n```\n\n</div>\n\n[go](https://example.com)'),'content/handbook/fixture.md');
 assert.equal(p.counts.good,1);assert.equal(p.counts.examples,1);assert.equal(p.counts.links,1);
 assert.equal(p.sections[1].counts.good,0);assert.equal(p.sections[1].subtreeCounts.good,1);
});
test('body approval survives a heading rename and harmless alias but never a wording change',()=>{
 const record={file:'content/handbook/fixture.md',anchor:'before',match:'body',status:'accepted-body',hash:bodyFingerprint('my exact words')};
 const p=applyReviewRecords(indexWriting(doc('## after\n\nmy exact words\n\n<span class="heading-alias" id="old"></span>'),'content/handbook/fixture.md'),[record]);
 assert.equal(p.sections[1].review,'Ani reviewed');assert.equal(p.review,'unreviewed');
 const changed=applyReviewRecords(indexWriting(doc('## before\n\nmy new words'),'content/handbook/fixture.md'),[record]);
 assert.equal(changed.sections[1].review,'changed since review');
});
test('a mixed paragraph retains quote provenance without whole-section acceptance',()=>{
 const record={file:'content/handbook/fixture.md',anchor:'opinion',match:'quote',quote:'my opinion',hash:fingerprint('my opinion'),status:'grounded-candidate'};
 const p=applyReviewRecords(indexWriting(doc('## opinion\n\nmy opinion. Agent supplied facts here.'),'content/handbook/fixture.md'),[record]);
 assert.equal(p.sections[1].voice,'grounded candidate');assert.equal(p.sections[1].review,'unreviewed');assert.ok(p.sections[1].observations[0].matches);
 const ambiguous=applyReviewRecords(indexWriting(doc('## opinion\n\nmy opinion and my opinion'),'content/handbook/fixture.md'),[record]);
 assert.equal(ambiguous.sections[1].voice,'unclassified');assert.ok(ambiguous.sections[1].observations[0].stale);
});
test('adopting a heading never approves its body and empty leaves remain writing gaps',()=>{
 const p=applyReviewRecords(indexWriting(doc('## chosen\n\nagent prose\n\n## empty'),'content/handbook/fixture.md'),[{file:'content/handbook/fixture.md',anchor:'chosen',match:'heading',hash:fingerprint('chosen'),status:'adopted-heading'}]);
 assert.equal(p.sections[1].review,'unreviewed');assert.equal(p.sections[2].written,'empty');assert.equal(p.written,false);
});
test('a quote or title can never be recorded as full body acceptance',()=>{
 const page=indexWriting(doc('## opinion\n\nmy words'),'content/handbook/fixture.md');
 for(const match of ['quote','heading']) assert.throws(()=>applyReviewRecords(page,[{file:page.file,anchor:'opinion',status:'accepted-body',match,quote:'my words',hash:fingerprint('my words')}]),/Invalid review scope/);
 const duplicate=indexWriting(doc('## original\n\nmy words\n\n## elsewhere\n\nmy words and my words'),'content/handbook/fixture.md');
 applyReviewRecords(duplicate,[{file:duplicate.file,anchor:'original',status:'grounded-candidate',match:'quote',quote:'my words',hash:fingerprint('my words')}]);
 assert.ok(duplicate.sections[1].observations[0].stale);
});
test('incomplete saves are rejected and fenced example markup is not counted',()=>{
 assert.throws(()=>indexWriting('---\ntitle: half a save','content/handbook/fixture.md'),/frontmatter is incomplete/);
 assert.equal(inspectFeatures('```html\n<div class="example-good example-block">fake</div>\n```').counts.examples,0);
 assert.equal(inspectFeatures('<div class="example-good example-block">real</div>').counts.good,1);
});
test('live inventory includes hidden drafts and keeps its axes independent',async()=>{
 const data=await buildEditorialInventory(process.cwd());
 assert.equal(data.summary.pages,data.summary.public+data.summary.hidden);
 assert.ok(data.pages.some(p=>p.file==='content/handbook/credentials-and-access.md'));
 assert.ok(data.pages.every(p=>Array.isArray(p.sections)&&Array.isArray(p.sources)));
 assert.ok(data.pages.flatMap(p=>p.sections).every(s=>typeof s.bodyHash==='string'&&typeof s.review==='string'&&typeof s.voice==='string'));
 assert.match(data.revision,/^[a-f0-9]{64}$/);
});


test('HTML timeline sections keep their paragraphs, links, and dates in the original parse context', async () => {
 const raw = await readFile('content/handbook/history.md', 'utf8');
 const page = indexWriting(raw, 'content/handbook/history.md');
 const whole = inspectFeatures(raw.replace(/^---[\s\S]*?---/, ''));
 for (const key of ['links', 'code', 'embeds', 'images', 'videos']) assert.equal(page.counts[key], whole.counts[key], key);
 assert.equal(page.counts.code, 0);
 const first = page.sections.find(s => s.anchor === 'the-transformer-creates-the-foundation');
 assert.match(first.text, /^2017 Attention Is All You Need/);
 assert.doesNotMatch(first.text, /2020/);
 assert.ok(first.links.includes('https://arxiv.org/abs/1706.03762'));
 assert.match(page.sections.find(s => s.anchor === 'prompts-become-a-general-interface').text, /^2020 GPT-3/);
});

test('HTML body clipping preserves real indented and fenced code without promoting literal headings', () => {
 const page = indexWriting(doc(`## code

    <h2>indented example</h2>

<ol>
  <li>
    <p>2017</p>
    <h2 id="event">event</h2>
    <p>A <a href="/reference/">reference</a> and TODO.</p>
  </li>
</ol>

\`\`\`html
<h2>fenced example</h2>
\`\`\`

<section><h2 id="empty">empty</h2></section>`), 'content/handbook/fixture.md');
 assert.deepEqual(page.sections.map(s => s.anchor), ['_top', 'code', 'event', 'empty']);
 assert.equal(page.counts.code, 2);
 assert.equal(page.sections[1].counts.code, 1);
 assert.equal(page.sections[2].counts.code, 1);
 assert.equal(page.sections[2].placeholder, true);
 assert.equal(page.sections[3].written, 'empty');
});

test('map links use the canonical page as their base and reject unsafe protocols', () => {
 const base = 'http://127.0.0.1:4330/handbook/operating-agents/';
 assert.equal(safeUrl('#what-should-i-ask-first', base), base + '#what-should-i-ask-first');
 assert.equal(safeUrl('../history/#event', base), 'http://127.0.0.1:4330/handbook/history/#event');
 assert.equal(safeUrl('/guides/grok/', base), 'http://127.0.0.1:4330/guides/grok/');
 assert.equal(safeUrl('https://example.com/docs', base), 'https://example.com/docs');
 for (const value of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/a']) assert.equal(safeUrl(value, base), null);
});

test('one ledger queue drives questions and review steps without inventing acceptance', () => {
 const page = indexWriting(doc('## opinion\n\nmy wording'), 'content/handbook/fixture.md');
 const question = { id:'question', kind:'input', scope:'page', status:'open', file:page.file, title:'actual use', detail:'One concrete example.', question:'What happened?' };
 const review = { id:'review', kind:'review', scope:'body', status:'open', file:page.file, anchor:'opinion', title:'review wording', detail:'Read this body.' };
 let steps = resolveWritingSteps([page], [question, review]);
 assert.equal(steps.filter(s => s.kind === 'input' && !s.resolved).length, 1);
 assert.ok(steps.some(s => s.scope === 'page' && s.kind === 'review')); // derived page milestone
 steps = resolveWritingSteps([page], [{ ...question, status:'answered', resolution:'User supplied example', source:'Direct response' }, review]);
 assert.equal(steps[0].resolved, true);
 assert.equal(steps[1].resolved, false);
 assert.equal(page.review, 'unreviewed');
 applyReviewRecords(page, [{file:page.file, anchor:'opinion', status:'accepted-body', match:'body', hash:page.sections[1].bodyHash}]);
 steps = resolveWritingSteps([page], [review]);
 assert.equal(steps[0].resolved, true);
 assert.equal(steps[1].resolved, false); // accepted body never closes the page milestone
 assert.throws(() => resolveWritingSteps([page], [question, question]), /Invalid writing step/);
 assert.throws(() => resolveWritingSteps([page], [{ ...question, status:'answered' }]), /Invalid writing step/);
 assert.equal(resolveWritingSteps([page], [{ ...review, anchor:'renamed' }])[0].stale, true);
});


test('inline HTML sources keep their video context across separate Markdown nodes', () => {
 const page = indexWriting(doc('## clip\n\nWatch <video><source src="/movie.mp4"></video> here.'), 'content/handbook/fixture.md');
 assert.equal(page.counts.videos, 1);
 assert.equal(page.sections[1].media[0].url, '/movie.mp4');
 assert.match(page.sections[1].text, /Watch here/);
});
