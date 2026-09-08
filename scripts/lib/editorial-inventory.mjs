import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import { parseFragment } from 'parse5';
import GithubSlugger from 'github-slugger';
import YAML from 'yaml';

const parser = unified().use(remarkParse).use(remarkGfm);
export const fingerprint = value => createHash('sha256').update(value.trim().replace(/\r\n/g, '\n') + '\n').digest('hex');
export const bodyFingerprint = value => fingerprint(value.replace(/<span\b[^>]*\bclass=["'][^"']*\bheading-alias\b[^"']*["'][^>]*><\/span>/g, ''));
const walk = (node, visit) => { visit(node); for (const child of node.children ?? node.childNodes ?? []) walk(child, visit); };
const htmlText = value => { let text = ''; walk(parseFragment(value), node => { if (node.nodeName === '#text') text += node.value + ' '; }); return text.trim(); };
const sum = (items, key) => items.reduce((total, item) => total + (item[key] ?? 0), 0);
const metrics = ['words', 'links', 'images', 'videos', 'gifs', 'embeds', 'code', 'examples', 'good', 'bad', 'tables'];
const totals = items => Object.fromEntries(metrics.map(key => [key, sum(items, key)]));

export function inspectFeatures(body, definitions = '') {
  return inspectTree(parser.parse(definitions + '\n\n' + body));
}

function inspectTree(tree, refs = new Map(tree.children.filter(n => n.type === 'definition').map(n => [n.identifier, n.url]))) {
  const links = [], media = [], code = [], htmlChunks = [], examples = [];
  let tables = 0, content = '';
  walk(tree, node => {
    if (node.type === 'link') links.push(node.url);
    if (node.type === 'linkReference' && refs.has(node.identifier)) links.push(refs.get(node.identifier));
    if (node.type === 'image' || node.type === 'imageReference') {
      const url = node.url ?? refs.get(node.identifier);
      if (url) media.push({ type: /\.gif(?:\?|$)/i.test(url) ? 'gif' : 'image', url, alt: node.alt ?? '' });
    }
    if (node.type === 'code') code.push({ language: node.lang ?? 'text', text: node.value });
    if (node.type === 'table') tables++;
    if (node.type === 'text' || node.type === 'inlineCode') content += node.value + ' ';
    if (node.type === 'html') {
      const html = node.value;
      content += htmlText(html) + ' ';
      htmlChunks.push(html);
    }
  });
  // Remark can split inline HTML into separate opening/source/closing nodes.
  // Reassemble only HTML nodes so video sources stay with their video, while
  // code fences cannot contribute pretend media, links, or headings.
  walk(parseFragment(htmlChunks.join('\n')), element => {
    const attrs = Object.fromEntries((element.attrs ?? []).map(a => [a.name, a.value]));
    const classes = (attrs.class ?? '').split(/\s+/);
    if (element.tagName === 'div' && classes.includes('example-block')) examples.push({ kind: classes.includes('example-good') ? 'good' : classes.includes('example-bad') ? 'bad' : 'example' });
    if (element.tagName === 'a' && attrs.href) links.push(attrs.href);
    if (['img', 'video', 'iframe'].includes(element.tagName)) {
      let url = attrs.src;
      if (!url && element.tagName === 'video') walk(element, child => { if (!url && child.tagName === 'source') url = child.attrs?.find(a => a.name === 'src')?.value; });
      if (url) media.push({ type: element.tagName === 'video' ? 'video' : element.tagName === 'iframe' ? 'embed' : /\.gif(?:\?|$)/i.test(url) ? 'gif' : 'image', url, alt: attrs.alt ?? attrs.title ?? '', poster: attrs.poster, loop: Object.hasOwn(attrs, 'loop') });
    }
  });
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return {
    counts: { words, links: links.length, images: media.filter(x => x.type === 'image').length, videos: media.filter(x => x.type === 'video').length, gifs: media.filter(x => x.type === 'gif').length, embeds: media.filter(x => x.type === 'embed').length, code: code.length, examples: examples.length, good: examples.filter(x => x.kind === 'good').length, bad: examples.filter(x => x.kind === 'bad').length, tables },
    links, media, code, examples, text: content.trim().replace(/\s+/g, ' '),
    hasContent: words > 0 || code.length > 0 || media.length > 0 || tables > 0,
    placeholder: /\b(TODO|TBD|coming soon|write this section)\b/.test(content),
  };
}

function featuresInRange(tree, start, end) {
  const refs = new Map(tree.children.filter(n => n.type === 'definition').map(n => [n.identifier, n.url]));
  const select = node => {
    if (node.type === 'definition' || node.type === 'heading') return null;
    if (node.position && (node.position.end.offset <= start || node.position.start.offset >= end)) return null;
    if (node.type === 'html') {
      const offset = node.position.start.offset;
      // Range boundaries are heading/container tags in HTML, not arbitrary text.
      const value = node.value.slice(Math.max(0, start - offset), end - offset);
      const fragment = parseFragment(value, { sourceCodeLocationInfo: true });
      const headings = [];
      walk(fragment, element => {
        if (/^h[1-6]$/.test(element.tagName) && element.sourceCodeLocation) headings.push(element.sourceCodeLocation);
      });
      // Keep opening/closing HTML nodes intact: inline video/source tags may
      // arrive as separate Markdown nodes and are joined by inspectTree.
      let clipped = value;
      for (const location of headings.sort((a, b) => b.startOffset - a.startOffset)) {
        clipped = clipped.slice(0, location.startOffset) + clipped.slice(location.endOffset);
      }
      return { ...node, value: clipped };
    }
    return node.children ? { ...node, children: node.children.map(select).filter(Boolean) } : node;
  };
  return inspectTree(select(tree) ?? { type: 'root', children: [] }, refs);
}

export function indexWriting(markdown, file) {
  const front = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!front) throw new Error(`${file}: canonical frontmatter is incomplete`);
  const data = YAML.parse(front[1]);
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.title !== 'string') throw new Error(`${file}: canonical frontmatter is invalid`);
  const body = markdown.slice(front[0].length);
  const tree = parser.parse(body), slugger = new GithubSlugger();
  const headings = [];
  for (const node of tree.children) {
    if (node.type === 'heading') {
      const title = htmlText(toString(node));
      headings.push({ title, depth: node.depth, anchor: slugger.slug(title), start: node.position.start.offset, end: node.position.end.offset });
    } else if (node.type === 'html') {
      const fragment = parseFragment(node.value, { sourceCodeLocationInfo: true });
      const visit = element => {
        // Literal examples, comments, scripts, and styles cannot create sections.
        if (['pre', 'code', 'script', 'style', 'template'].includes(element.tagName)) return;
        if (/^h[1-6]$/.test(element.tagName) && element.sourceCodeLocation) {
          const location = element.sourceCodeLocation, offset = node.position.start.offset;
          const title = htmlText(node.value.slice(location.startTag.endOffset, location.endTag?.startOffset ?? location.endOffset));
          const id = element.attrs.find(a => a.name === 'id')?.value;
          let sectionStart = location.startOffset;
          // A timeline entry's date belongs with its heading, not the prior entry.
          // Use semantic containers only; ordinary wrapper divs do not move boundaries.
          for (let parent = element.parentNode; parent; parent = parent.parentNode) {
            if (!['li', 'section', 'article'].includes(parent.tagName) || !parent.sourceCodeLocation) continue;
            const first = []; walk(parent, child => { if (/^h[1-6]$/.test(child.tagName)) first.push(child); });
            if (first[0] === element) sectionStart = parent.sourceCodeLocation.startOffset;
            break;
          }
          headings.push({ title, depth: Number(element.tagName[1]), anchor: id ?? slugger.slug(title),
            start: offset + location.startOffset, end: offset + location.endOffset, sectionStart: offset + sectionStart });
        } else for (const child of element.childNodes ?? []) visit(child);
      };
      visit(fragment);
    }
  }
  if (!headings.length || headings[0].depth !== 1) headings.unshift({ title: data.title ?? file, depth: 1, anchor: '_top', start: 0, end: 0, synthetic: true });
  const baseLine = (front?.[0].match(/\n/g)?.length ?? 0);
  const sections = headings.map((h, i) => {
    const from = h.sectionStart ?? h.end;
    const next = headings[i + 1];
    const until = next?.sectionStart ?? next?.start ?? body.length;
    const ownBody = body.slice(from, h.start) + body.slice(h.end, until);
    const peer = headings.slice(i + 1).find(x => x.depth <= h.depth);
    const end = peer?.sectionStart ?? peer?.start ?? body.length;
    const subtree = body.slice(h.end, end);
    const features = featuresInRange(tree, from, until);
    return { ...h, id: `${file}#${h.anchor}`, line: baseLine + body.slice(0, h.start).split('\n').length,
      body: ownBody, bodyHash: bodyFingerprint(ownBody), subtreeHash: bodyFingerprint(subtree), headingHash: fingerprint(h.title), ...features,
      written: features.hasContent ? 'written' : end > (headings[i + 1]?.start ?? body.length) ? 'contains sections' : 'empty',
      review: 'unreviewed', voice: 'unclassified', observations: [],
    };
  });
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i], descendants = [];
    for (let j = i + 1; j < sections.length && sections[j].depth > section.depth; j++) descendants.push(sections[j]);
    section.subtreeCounts = totals([section.counts, ...descendants.map(x => x.counts)]);
    if (!section.hasContent && descendants.some(x => x.hasContent)) section.written = 'contains sections';
    section.exampleTopic = /\bexample\b/i.test(section.title);
  }
  return { file, title: data.title ?? file, scope: data.navigation?.scope ?? 'handbook', order: data.navigation?.order ?? 0,
    route: file === 'content/home.md' ? '/' : '/' + file.slice('content/'.length).replace(/\.md$/, '') + '/',
    hidden: data.draft === true, metadata: { completion: data.completion ?? null, voice: data.voice ?? null, evidence: data.evidence ?? [], checkedAt: data.checkedAt ?? null, status: data.status },
    sourceIds: data.sources ?? [], fileHash: fingerprint(markdown), bodyHash: fingerprint(body), sections, counts: totals(sections.map(s => s.counts)),
    written: sections.every(s => s.written !== 'empty' || s.synthetic) && !sections.some(s => s.placeholder), review: 'unreviewed', observations: [],
  };
}

function validateScope(record) {
  const allowed = {
    'accepted-body': ['body'], 'accepted-page': ['file'], 'adopted-heading': ['heading'],
    'preserve': ['file', 'body', 'quote'], 'grounded-candidate': ['body', 'quote'], 'review-started': ['body', 'heading', 'quote'],
  };
  if (!allowed[record.status]?.includes(record.match)) throw new Error(`Invalid review scope: ${record.id ?? record.status}`);
  if (['accepted-body', 'adopted-heading', 'grounded-candidate'].includes(record.status) && !record.anchor) throw new Error('A partial review must name its section');
  if (record.status === 'accepted-page' && record.anchor) throw new Error('Whole-page acceptance must cover the entire file');
}

export function applyReviewRecords(page, records) {
  for (const record of records.filter(r => r.file === page.file)) {
    validateScope(record);
    const property = record.match === 'heading' ? 'headingHash' : record.match === 'subtree' ? 'subtreeHash' : 'bodyHash';
    const occurrences = record.quote ? page.sections.reduce((n, s) => n + s.body.split(record.quote).length - 1, 0) : 0;
    const candidates = page.sections.filter(s => record.match === 'quote' ? occurrences === 1 && s.body.includes(record.quote) : s[property] === record.hash);
    let section = record.anchor ? page.sections.find(s => s.anchor === record.anchor) : null;
    // Exact unique content can survive a heading rename; fuzzy or ordinal matching cannot.
    if (record.anchor && candidates.length === 1) section = candidates[0];
    const target = record.anchor ? section : page;
    if (!target) { page.observations.push({ ...record, matches: false, stale: true }); continue; }
    const actual = record.match === 'quote' ? candidates.length === 1 ? fingerprint(record.quote) : null : record.match === 'heading' ? section?.headingHash : record.match === 'body' ? section?.bodyHash ?? page.bodyHash : record.match === 'subtree' ? section?.subtreeHash : page.fileHash;
    // Every counted acceptance must identify immutable text. Evidence may be partial.
    const matches = Boolean(record.hash && record.hash === actual);
    const observation = { ...record, matches, stale: !matches };
    target.observations.push(observation);
    if (!matches) { if (['accepted-body', 'accepted-page'].includes(record.status) && target.review !== 'Ani reviewed') target.review = 'changed since review'; continue; }
    if (record.status === 'accepted-body') { target.review = 'Ani reviewed'; if (section) section.voice = 'accepted wording'; }
    if (record.status === 'accepted-page') { page.review = 'Ani reviewed'; for (const s of page.sections) { s.review = 'Ani reviewed'; s.voice = 'accepted wording'; } }
    if (record.status === 'preserve') {
      const label = record.origin === 'frozen-compatibility-unknown-authorship' ? 'frozen compatibility' : 'preserve original';
      if (section && record.match !== 'quote') section.voice = label;
      else if (!section) for (const s of page.sections) s.voice = label;
    }
    if (record.status === 'grounded-candidate' && section && section.voice === 'unclassified') section.voice = 'grounded candidate';
    if (record.status === 'review-started' && target.review === 'unreviewed') target.review = 'in progress';
  }
  // Child acceptance never approves the enclosing page or adjacent prose.
  return page;
}


// The existing ledger is the sole authored queue. Review steps close only from
// matching review evidence; answering an input question does not approve prose.
export function resolveWritingSteps(pages, queue) {
  const ids = new Set();
  const steps = queue.map(step => {
    if (!step.id || ids.has(step.id) || !['input', 'review', 'research'].includes(step.kind)
      || typeof step.title !== 'string' || typeof step.detail !== 'string'
      || typeof step.file !== 'string' || !['page', 'body'].includes(step.scope)
      || !['open', 'answered'].includes(step.status)
      || (step.scope === 'body' && !step.anchor)
      || (step.kind === 'input' && (typeof step.question !== 'string' || !step.question.trim()))
      || (step.status === 'answered' && (step.kind === 'review' || !step.resolution?.trim() || !step.source?.trim()))) {
      throw new Error(`Invalid writing step: ${step.id ?? step.title}`);
    }
    ids.add(step.id);
    const page = pages.find(p => p.file === step.file);
    const section = page?.sections.find(s => s.anchor === step.anchor);
    const stale = !page || Boolean(step.anchor && !section);
    const target = step.scope === 'page' ? page : section;
    const resolved = !stale && (step.kind === 'review' ? target?.review === 'Ani reviewed' : step.status === 'answered');
    return { ...step, stale, resolved };
  });
  // Remaining chapters appear automatically, including new and hidden drafts.
  // Preserved pages are deliberate exceptions, not silently approved pages.
  for (const page of pages) {
    if (page.review === 'Ani reviewed' || page.observations.some(o => o.status === 'preserve' && o.matches)
      || steps.some(s => s.kind === 'review' && s.scope === 'page' && s.file === page.file)) continue;
    steps.push({ id: `review:${page.file}`, kind: 'review', scope: 'page', status: 'open', file: page.file,
      title: page.title, detail: page.hidden ? 'Review this hidden chapter before promoting it.' : 'Review wording and reader coverage, one section at a time.',
      resolved: false, stale: false });
  }
  return steps;
}

async function filesBelow(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map(entry => entry.isDirectory() ? filesBelow(path.join(directory, entry.name)) : entry.name.endsWith('.md') ? [path.join(directory, entry.name)] : []))).flat();
}

export async function buildEditorialInventory(root) {
  const started = performance.now();
  const [files, ledger, blueprintRaw, registryRaw] = await Promise.all([
    filesBelow(path.join(root, 'content')), readFile(path.join(root, 'editorial/review-ledger.md'), 'utf8'),
    readFile(path.join(root, 'editorial/handbook-blueprints.json'), 'utf8'), readFile(path.join(root, 'editorial/sources.json'), 'utf8'),
  ]);
  const blueprint = JSON.parse(blueprintRaw), registry = JSON.parse(registryRaw);
  const block = ledger.match(/<!-- live-map:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- live-map:end -->/);
  if (!block || ledger.split('<!-- live-map:start -->').length !== 2 || ledger.split('<!-- live-map:end -->').length !== 2) throw new Error('Exactly one complete live map record block is required');
  const evidence = JSON.parse(block[1]);
  if (!Array.isArray(evidence.records) || !Array.isArray(evidence.next ?? []) || !Array.isArray(evidence.notes ?? [])) throw new Error('Live map evidence shape is invalid');
  const ids = new Set();
  for (const record of evidence.records) {
    if (!record || typeof record.id !== 'string' || ids.has(record.id) || !/^[a-f0-9]{64}$/.test(record.hash) || typeof record.file !== 'string') throw new Error('Live map records need unique identities and exact fingerprints');
    if (record.match === 'quote' && (typeof record.quote !== 'string' || !record.quote.trim())) throw new Error('A quote record must contain its exact text');
    ids.add(record.id); validateScope(record);
  }
  const pages = await Promise.all(files.map(async absolute => {
    const file = path.relative(root, absolute), raw = await readFile(absolute, 'utf8');
    const page = applyReviewRecords(indexWriting(raw, file), evidence.records ?? []);
    const plan = blueprint.guides.find(g => g.file === file);
    page.missingHeadings = (plan?.headings ?? []).filter(h => !page.sections.some(s => '#'.repeat(s.depth) + ' ' + s.title === h));
    page.sources = page.sourceIds.map(id => registry.sources.find(s => s.id === id) ?? { id, title: 'unregistered source' });
    return page;
  }));
  pages.sort((a, b) => ['handbook','codex','claude-code','grok'].indexOf(a.scope) - ['handbook','codex','claude-code','grok'].indexOf(b.scope) || a.order - b.order || a.file.localeCompare(b.file));
  const steps = resolveWritingSteps(pages, evidence.next ?? []);
  for (const page of pages) page.questions = steps.filter(s => s.kind === 'input' && s.file === page.file && !s.resolved);
  const sections = pages.flatMap(p => p.sections), observations = pages.flatMap(p => [...p.observations, ...p.sections.flatMap(s => s.observations)]);
  const unmappedRecords = evidence.records.filter(record => !pages.some(page => page.file === record.file));
  const snapshot = { pages, unmappedRecords, notes: evidence.notes ?? [], next: steps.filter(s => !s.resolved),
    summary: { pages: pages.length, public: pages.filter(p => !p.hidden).length, hidden: pages.filter(p => p.hidden).length,
      writtenPages: pages.filter(p => p.written).length, reviewedPages: pages.filter(p => p.review === 'Ani reviewed').length,
      sections: sections.filter(s => s.depth === 2).length, subsections: sections.filter(s => s.depth === 3).length, otherHeadings: sections.filter(s => s.depth > 3).length,
      bodyBlocks: sections.filter(s => s.hasContent).length, reviewedBodies: sections.filter(s => s.review === 'Ani reviewed').length,
      empty: sections.filter(s => s.written === 'empty' && !s.synthetic).length,
      preservedPages: pages.filter(p => p.observations.some(o => o.status === 'preserve' && o.matches)).length,
      adoptedHeadings: sections.filter(s => s.observations.some(o => o.status === 'adopted-heading' && o.matches)).length,
      groundedBlocks: sections.filter(s => s.voice === 'grounded candidate').length,
      voiceUnclassified: sections.filter(s => s.hasContent && s.voice === 'unclassified').length,
      staleRecords: observations.filter(o => o.stale).length + unmappedRecords.length,
      openQuestions: steps.filter(s => s.kind === 'input' && !s.resolved).length,
      staleSteps: steps.filter(s => s.stale).length,
      pagesWithMedia: pages.filter(p => p.counts.images + p.counts.videos + p.counts.gifs + p.counts.embeds > 0).length,
      ...totals(pages.map(p => p.counts)),
    },
  };
  return { ...snapshot, revision: fingerprint(JSON.stringify(snapshot)), generatedAt: new Date().toISOString(), scanMs: Math.round(performance.now() - started) };
}
