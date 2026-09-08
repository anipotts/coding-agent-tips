import { safeUrl } from './links.js';
const $ = selector => document.querySelector(selector);
const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
const link = (text, href, route = '/') => { const url = safeUrl(href, new URL(route, location.origin)); if (!url) return el('span', text); const a = el('a', text); a.href = url; a.target = '_blank'; a.rel = 'noopener'; return a; };
const tag = (text, kind = '') => el('span', text, 'tag ' + kind);
let data, selected = new URLSearchParams(location.search).get('page'), openIds = new Set(), fetching = false, rerun = false;
let theme = localStorage.getItem('starlight-theme') ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = theme;
$('#theme').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; localStorage.setItem('starlight-theme', theme); });
const scopeName = scope => ({ 'claude-code': 'claude code' }[scope] ?? scope);
const mediaCount = c => c.images + c.videos + c.gifs + c.embeds;
const readStatus = s => s.review === 'Ani reviewed' ? 'body reviewed' : s.review === 'in progress' ? 'review started' : s.review === 'changed since review' ? 'changed since review' : s.hasContent ? 'needs wording review' : 'section group';
const voiceStatus = s => s.voice === 'grounded candidate' ? 'contains your perspective' : s.voice === 'accepted wording' ? 'wording accepted' : s.voice === 'preserve original' ? 'preserve original' : s.voice === 'frozen compatibility' ? 'frozen compatibility' : 'voice review unrecorded';
function matchesSection(section, page) {
  const q = $('#query').value.trim().toLowerCase(), filter = $('#filter').value;
  const relevant = !q || [page.title, page.scope, section.title, section.text, ...page.questions.map(q => q.question)].join(' ').toLowerCase().includes(q);
  const c = section.counts;
  const filters = {
    input: page.questions.length > 0, all: true, review: section.hasContent && section.review !== 'Ani reviewed', accepted: section.review === 'Ani reviewed' || section.observations.some(o => o.matches && ['preserve','adopted-heading'].includes(o.status)) || section.voice === 'preserve original',
    voice: section.hasContent && section.voice === 'unclassified', empty: section.written === 'empty' || section.placeholder,
    media: mediaCount(c) > 0, examples: c.examples + c.code > 0 || section.exampleTopic, links: c.links > 0, hidden: page.hidden,
  };
  return relevant && filters[filter];
}
function renderSummary() {
  const s = data.summary;
  const stats = [
    [s.pages, 'intended pages', `${s.public} visible locally / ${s.hidden} hidden`],
    [s.sections + s.subsections + s.otherHeadings, 'sections + subsections', `${s.sections} H2 / ${s.subsections} H3${s.otherHeadings ? ` / ${s.otherHeadings} deeper` : ''}`],
    [s.writtenPages, 'pages have content', `${s.empty} empty headings / practical review pending`],
    [s.reviewedBodies, 'accepted body blocks', `${s.reviewedPages} whole pages explicitly accepted`],
    [s.images + s.videos + s.gifs + s.embeds, 'media placements', `${s.images} images / ${s.videos} videos / ${s.gifs} GIFs`],
    [s.links, 'authored links', `${s.examples} labeled examples / ${s.code} code blocks`],
  ];
  $('#summary').replaceChildren(...stats.map(([count,title,desc]) => { const box = el('div', undefined, 'stat'); box.append(el('strong', String(count)), el('span', title), el('small', desc)); return box; }));
  $('#freshness').textContent = `updated ${new Date(data.generatedAt).toLocaleTimeString([], { hour:'numeric', minute:'2-digit', second:'2-digit' })} / ${data.scanMs} ms scan`;
  const nextCards = data.next.map(step => { const a = el('a', step.title); a.href = '#detail'; a.append(el('small', `${step.kind === 'input' ? 'Your input: ' : ''}${step.detail}${step.stale ? ' Target needs remapping.' : ''}`)); a.addEventListener('click', e => { e.preventDefault(); selected=step.file; $('#scope').value='all'; $('#filter').value='all'; $('#query').value=''; if(step.anchor)openIds.add(`${step.file}#${step.anchor}`); render(); const target=document.getElementById(`${step.file}#${step.anchor}`) ?? $('#detail');target.scrollIntoView({block:'start'});target.tabIndex=-1;target.focus({preventScroll:true}); }); return a; });
  $('#next').replaceChildren(...nextCards.slice(0, 6));
  if(nextCards.length > 6){const more=el('details',undefined,'remaining-steps');more.append(el('summary',`${nextCards.length - 6} more steps / ${data.summary.openQuestions} open questions`));const list=el('div',undefined,'next');list.append(...nextCards.slice(6));more.append(list);$('#next').append(more);}
}
function sectionRow(s, page) {
  const row = el('details', undefined, 'section-row'); row.id=s.id; row.dataset.depth=s.depth; row.open=openIds.has(s.id);
  row.addEventListener('toggle', () => row.open ? openIds.add(s.id) : openIds.delete(s.id));
  const summary = el('summary'), top=el('div'), title=el('span', undefined, 'section-title');
  title.append(el('small', s.synthetic ? 'INTRO' : `H${s.depth}`), document.createTextNode(s.title));
  const info=el('div', undefined, 'section-info');
  info.append(tag(readStatus(s), s.review === 'Ani reviewed' ? 'good' : s.review === 'changed since review' ? 'warn' : ''));
  if(s.hasContent) info.append(tag(voiceStatus(s), s.voice !== 'unclassified' ? 'pending' : ''));
  if(s.observations.some(o => o.matches && o.status === 'adopted-heading')) info.append(tag('title chosen by you','good'));
  for(const [key,label] of [['images','image'],['videos','video'],['gifs','GIF'],['embeds','embed'],['links','link'],['code','code block']]) if(s.counts[key]) info.append(tag(`${s.counts[key]} ${label}${s.counts[key]===1?'':'s'}`));
  if(s.counts.good)info.append(tag(`${s.counts.good} good example${s.counts.good===1?'':'s'}`,'good'));
  if(s.counts.bad)info.append(tag(`${s.counts.bad} weak example${s.counts.bad===1?'':'s'}`,'warn'));
  if(s.exampleTopic)info.append(tag('example section'));
  if(s.placeholder || s.written==='empty')info.append(tag('writing gap','warn'));
  top.append(title,info);summary.append(top);row.append(summary);
  // Details are created only when opened, so media never loads for hidden rows.
  let loaded=false;
  function load() {
    if(!row.open || loaded)return;loaded=true;
    const body=el('div',undefined,'section-body');body.append(el('p',`${page.file}:${s.line}`,'source-location'));
    if(!page.hidden)body.append(link('open this section ↗',page.route+'#'+s.anchor));
    for(const o of s.observations){
      body.append(el('p',`${o.stale ? 'Changed or needs remapping. ' : ''}${o.note}`));
      if(o.quote){const detail=el('details'),sum=el('summary','exact recorded passage');detail.append(sum,el('pre',o.quote,'excerpt'));body.append(detail);}
      const sources=el('p',o.source ?? '','source-location');body.append(sources);
    }
    if(s.voice==='unclassified' && s.hasContent)body.append(el('p','No exact voice review is recorded for this block. Personal meaning and wording acceptance still need to be checked.'));
    if(s.media.length){const assets=el('div',undefined,'assets');for(const m of s.media){const fig=el('figure');if(m.url.startsWith('/media/')){const media=el(m.type==='video'?'video':'img');media.src=m.url;if(m.type==='video'){media.controls=true;media.preload='none';if(m.poster)media.poster=m.poster;}else{media.alt=m.alt;media.loading='lazy';}fig.append(media);}fig.append(el('figcaption',`${m.type}${m.loop?' / looping':''}: ${m.alt || m.url}`),link('open asset ↗',m.url,page.route));assets.append(fig);}body.append(assets);}
    if(s.links.length){const links=el('details');links.append(el('summary',`${s.links.length} authored links`));const list=el('ul');for(const href of s.links){const li=el('li');li.append(link(href,href,page.route));list.append(li);}links.append(list);body.append(links);}
    if(s.code.length){const codes=el('details');codes.append(el('summary',`${s.code.length} code / prompt blocks`));for(const c of s.code)codes.append(el('pre',c.text,'excerpt'));body.append(codes);}
    if(s.text) {const excerpt=el('details');excerpt.append(el('summary','read this block'),el('p',s.text,'excerpt'));body.append(excerpt);}
    row.append(body);
  }
  row.addEventListener('toggle',load);load();return row;
}
function renderDetail(page) {
  const node=$('#detail');node.replaceChildren();if(!page){node.append(el('p','No pages match. Try another filter.','empty'));return;}
  const header=el('div',undefined,'detail-heading'), heading=el('div');heading.append(el('h2',page.title),el('p',`${scopeName(page.scope)} / ${page.hidden?'hidden draft':'visible in local preview'} / ${page.sections.filter(s=>s.depth>1).length} headings`));header.append(heading);if(!page.hidden)header.append(link('open page ↗',page.route));node.append(header);
  const c=page.counts, totals=el('div',undefined,'totals');
  totals.append(tag(page.written?'draft content present':'writing gaps',page.written?'':'warn'),tag(page.review==='Ani reviewed'?'whole page reviewed':'whole page review pending'),tag(`${page.sourceIds.length} registered sources`));
  if(page.observations.some(o=>o.matches&&o.status==='preserve'))totals.append(tag('preserve as directed','pending'));
  node.append(totals);
  for(const o of page.observations)node.append(el('p',`${o.stale?'Changed since this record. ':''}${o.note}`,'page-note'));
  if(page.hidden && page.metadata.completion==='outline')node.append(el('p','This chapter has draft text. Its older “outline” metadata still keeps it hidden until review; it is not an unwritten page.','page-note'));
  if(page.metadata.checkedAt)node.append(el('p',`Page source check recorded ${new Date(page.metadata.checkedAt).toLocaleDateString()}. Linked sources and checks do not establish that every sentence is verified.`,'page-note'));
  for(const missing of page.missingHeadings)node.append(el('p','Planned heading not found: '+missing,'page-note'));
  for(const q of page.questions){const note=el('div',undefined,'page-note');note.append(el('strong',q.title),el('p',q.question),el('small',q.detail));node.append(note);}
  const shown=page.sections.filter(s=>matchesSection(s,page));
  for(const section of shown)node.append(sectionRow(section,page));
  if(page.sources.length){const sources=el('details',undefined,'section-row');sources.append(el('summary',`${page.sources.length} source references`));const list=el('ul');for(const source of page.sources){const li=el('li');li.append(source.url?link(source.title,source.url):el('span',source.title));li.append(document.createTextNode(source.last_checked?` / checked ${source.last_checked}`:''));list.append(li);}sources.append(list);node.append(sources);}
}
function render() {
  if(!data)return;
  const scope=$('#scope').value;
  const pages=data.pages.filter(p=>(scope==='all'||p.scope===scope)&&p.sections.some(s=>matchesSection(s,p)));
  if(!pages.some(p=>p.file===selected))selected=pages[0]?.file;
  const nav=$('#pages');nav.replaceChildren();let group;
  for(const page of pages){if(group!==page.scope){group=page.scope;nav.append(el('h2',scopeName(group)));}const button=el('button',undefined,'page-button');button.dataset.page=page.file;button.setAttribute('aria-current',String(page.file===selected));button.append(el('strong',page.title),el('small',`${page.sections.filter(s=>s.depth>1).length} headings / ${page.hidden?'hidden':'visible'}${mediaCount(page.counts)?' / media':''}`));const dots=el('span',undefined,'page-dots');dots.setAttribute('aria-hidden','true');for(const s of page.sections.filter(s=>s.hasContent)){const dot=el('i');dot.dataset.review=s.review;dot.dataset.voice=s.voice;dots.append(dot);}button.append(dots);button.addEventListener('click',()=>{selected=page.file;render();const focused=[...nav.querySelectorAll('button')].find(b=>b.dataset.page===selected);focused?.focus({preventScroll:true});});nav.append(button);}
  $('#results').textContent=`${pages.length} of ${data.pages.length} pages shown / ${data.summary.adoptedHeadings} titles chosen by you / ${data.summary.groundedBlocks} blocks contain your perspective / ${data.summary.voiceUnclassified} body blocks have no recorded voice review / ${data.summary.openQuestions} open questions${data.summary.staleSteps ? ` / ${data.summary.staleSteps} next steps need remapping` : ''}${data.summary.staleRecords?` / ${data.summary.staleRecords} records changed or need remapping`:''}`;
  renderDetail(pages.find(p=>p.file===selected));
  if(selected)history.replaceState(null,'','?page='+encodeURIComponent(selected));
}
for(const selector of ['#query','#scope','#filter'])$(selector).addEventListener('input',render);
async function refresh() {
  if(fetching){rerun=true;return;}fetching=true;
  try{const r=await fetch('/__progress/data.json',{cache:'no-store'});if(!r.ok)throw Error('scan unavailable');const next=await r.json();if(!data||next.revision!==data.revision){data=next;renderSummary();render();}$('#failure').hidden=true;}
  catch{$('#failure').textContent='The current files could not be read. Your last snapshot is still here; the next successful save will refresh it.';$('#failure').hidden=false;}
  finally{fetching=false;if(rerun){rerun=false;refresh();}}
}
const events=new EventSource('/__progress/events');
events.addEventListener('connected',()=>{$('#connection').textContent='live';$('#connection').dataset.live='true';refresh();});
events.addEventListener('updated',refresh);
events.addEventListener('reload',()=>location.reload());
events.addEventListener('scan-error',()=>{$('#failure').textContent='A file is temporarily invalid. Keeping the last readable snapshot until the next save.';$('#failure').hidden=false;});
events.onerror=()=>{$('#connection').textContent='reconnecting';$('#connection').dataset.live='false';};
window.addEventListener('online',refresh);
refresh();
