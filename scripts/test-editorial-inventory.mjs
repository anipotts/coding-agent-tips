import test from 'node:test';
import assert from 'node:assert/strict';
import { indexWriting, inspectFeatures, applyReviewRecords, fingerprint, bodyFingerprint, buildEditorialInventory } from './lib/editorial-inventory.mjs';
const doc = body => `---\ntitle: fixture\nnavigation: { scope: handbook, order: 1 }\n---\n\n${body}`;

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
