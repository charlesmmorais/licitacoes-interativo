// Página de capítulo: trilha interativa + texto integral
import { el, $, $$, waves, store } from './core.js';
import { CHAPTERS, loadLessons, PDF_URL, SITE_URL, PDF_OFFSET } from './meta.js';
import { mountLesson } from './lesson.js';
import { topbar, footer, chapterProgress } from './app.js';

const params = new URLSearchParams(location.search);
const N = Math.min(6, Math.max(1, +params.get('c') || 1));
const CH = CHAPTERS[N - 1];
document.title = `${N}. ${CH.title} · Licitações e Contratos interativo`;
topbar(N);

const main = el('main', {}, document.body);
const hero = el('section', { class: 'ch-hero' }, main);
waves(el('canvas', { class: 'waves', 'aria-hidden': 'true' }, hero), { layers: 5 });
const hw = el('div', { class: 'wrap' }, hero);
el('a', { class: 'crumb', href: './' }, hw, '← Mapa dos capítulos');
el('div', { class: 'ch-head' }, hw, `<div class="num">${N}</div><div><h1>${CH.title}</h1><p>${CH.tag}</p></div>`);
const tabs = el('div', { class: 'tabs', role: 'tablist' }, hw);
const tT = el('button', { class: 'tab on', role: 'tab' }, tabs, '⚡ Trilha interativa');
const tR = el('button', { class: 'tab', role: 'tab' }, tabs, '📖 Texto integral');
const prog = el('span', { class: 'chip-progress', style: 'align-self:center;margin-left:6px' }, tabs, '');

const trilha = el('section', { class: 'sec-dark' }, main);
const tw = el('div', { class: 'wrap' }, trilha);
const lessonsEl = el('div', { class: 'lessons' }, tw);
const reader = el('section', { class: 'reader', hidden: true }, main);
const nav = el('div', { class: 'wrap ch-nav' }, trilha);
if (N > 1) el('a', { class: 'btn btn-ghost', href: `capitulo.html?c=${N - 1}` }, nav, `← ${N - 1}. ${CHAPTERS[N - 2].title}`);
if (N < 6) el('a', { class: 'btn btn-primary', href: `capitulo.html?c=${N + 1}`, style: 'margin-left:auto' }, nav, `${N + 1}. ${CHAPTERS[N].title} →`);
el('div', { style: 'height:60px' }, trilha);
footer();

function setTab(r) {
  tT.classList.toggle('on', !r); tR.classList.toggle('on', r);
  trilha.hidden = r; reader.hidden = !r;
  if (r) initReader();
}
tT.onclick = () => { setTab(false); history.replaceState(null, '', location.pathname + location.search); };
tR.onclick = () => { setTab(true); };

let lessons = [];
loadLessons(N).then(ls => {
  lessons = ls;
  const upd = () => { const p = chapterProgress(ls); prog.textContent = `${p.done}/${p.total} lições`; };
  ls.forEach((L, i) => mountLesson(lessonsEl, L, i, {
    onRead: sn => openSection(sn),
    onDone: () => { upd(); dispatchEvent(new Event('lesson-done')); }
  }));
  upd();
});

/* ------------------------ leitor ------------------------ */
let data = null, sumario = null, cur = 0, query = '';
let docEl, tocEl, ready;
function initReader() {
  if (ready) return ready;
  reader.innerHTML = '';
  const g = el('div', { class: 'wrap reader-grid' }, reader);
  const side = el('div', {}, g);
  el('button', { class: 'btn btn-primary toc-toggle', style: 'margin-bottom:12px', onclick: () => tocEl.classList.toggle('open') }, side, '☰ Seções do capítulo');
  tocEl = el('nav', { class: 'toc', 'aria-label': 'Seções' }, side);
  docEl = el('article', { class: 'doc' }, g, '<p>Carregando o texto integral…</p>');
  ready = Promise.all([fetch(`data/cap${N}.json`).then(r => r.json()), fetch('data/sumario.json').then(r => r.json())]).then(([d, s]) => {
    data = d; sumario = s.find(x => x.ch === String(N));
    const search = el('input', { type: 'search', placeholder: 'Buscar neste capítulo…', 'aria-label': 'Buscar neste capítulo' }, tocEl);
    const info = el('div', { class: 'hint', style: 'margin:-6px 0 8px;color:var(--ink-2)' }, tocEl);
    data.forEach((sec, i) => {
      const depth = sec.num.split('.').length;
      el('a', { href: `#s-${sec.num}`, class: 'd' + depth, 'data-i': i, onclick: e => { e.preventDefault(); show(i); tocEl.classList.remove('open'); } }, tocEl, `<span class="n">${sec.num}</span>${sec.title}`);
    });
    let tmr;
    search.oninput = () => { clearTimeout(tmr); tmr = setTimeout(() => {
      query = norm(search.value.trim());
      let hits = 0;
      $$('a[data-i]', tocEl).forEach(a => { const h = query.length > 2 && textOf(data[+a.dataset.i]).includes(query); a.classList.toggle('hit', h); hits += h; });
      info.textContent = query.length > 2 ? `${hits} seção(ões) com “${search.value.trim()}”` : '';
      show(cur, false);
    }, 250); };
    if (!location.hash.startsWith('#s-')) show(0, false);
  });
  return ready;
}
const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const cache = new Map();
function textOf(sec) {
  if (!cache.has(sec.num)) cache.set(sec.num, norm(sec.blocks.map(b => b.h || (b.rows || []).flat().join(' ')).join(' ').replace(/<[^>]+>/g, '')));
  return cache.get(sec.num);
}
async function openSection(num) {
  const ch = num.split('.')[0];
  if (ch !== String(N)) { location.href = `capitulo.html?c=${ch}#s-${num}`; return; }
  setTab(true); await initReader();
  const i = data.findIndex(s => s.num === num);
  show(i < 0 ? 0 : i);
}
function show(i, scroll = true) {
  cur = i; const sec = data[i];
  $$('a[data-i]', tocEl).forEach(a => a.classList.toggle('on', +a.dataset.i === i));
  const meta = sumario?.sections.find(s => s.num === sec.num);
  const page = meta?.page;
  docEl.innerHTML = '';
  el('div', { class: 'toolbar' }, docEl, `<span>Capítulo ${N} · seção ${i + 1} de ${data.length}${page ? ` · p. ${page} do e-book` : ''}</span>
    <span>${page ? `<a href="${PDF_URL}#page=${page + PDF_OFFSET}" target="_blank" rel="noopener">abrir no PDF</a> · ` : ''}<a href="${SITE_URL}${sec.slug}/" target="_blank" rel="noopener">ver no site do TCU</a></span>`);
  el('div', { class: 'snum' }, docEl, sec.num);
  el('h2', {}, docEl, sec.title);
  const rel = lessons.filter(L => L.secs.includes(sec.num));
  if (rel.length) {
    const r = el('div', { style: 'margin:-8px 0 18px;display:flex;gap:8px;flex-wrap:wrap' }, docEl);
    rel.forEach(L => el('button', { class: 'cite', style: 'color:var(--accent);border-color:var(--accent)', onclick: () => { setTab(false); $('#' + L.id)?.scrollIntoView({ behavior: 'smooth' }); } }, r, `⚡ Lição interativa: ${L.title}`));
  }
  renderBlocks(docEl, sec);
  if (query.length > 2) highlight(docEl, query);
  const nv = el('div', { class: 'doc-nav' }, docEl);
  if (i > 0) el('button', { onclick: () => show(i - 1) }, nv, `← ${data[i - 1].num} ${data[i - 1].title}`);
  if (i < data.length - 1) el('button', { onclick: () => show(i + 1), style: 'margin-left:auto' }, nv, `${data[i + 1].num} ${data[i + 1].title} →`);
  history.replaceState(null, '', `${location.pathname}${location.search}#s-${sec.num}`);
  if (scroll) reader.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderBlocks(root, sec) {
  let ul = null;
  for (const b of sec.blocks) {
    if (b.t !== 'li') ul = null;
    if (b.t === 'p') el('p', {}, root, b.h);
    else if (b.t === 'li') { ul ||= el('ul', {}, root); el('li', {}, ul, b.h); }
    else if (b.t === 'h') el('h4', {}, root, b.h);
    else if (b.t === 'cap') el('div', { class: 'cap' }, root, b.h);
    else if (b.t === 'src') el('div', { class: 'src' }, root, b.h);
    else if (b.t === 'img') el('figure', {}, root, `<img loading="lazy" src="assets/fig/${b.src}" alt="${(b.alt || '').replace(/"/g, '')}">`);
    else if (b.t === 'table') {
      const w = el('div', { class: 'tbl' }, root);
      const t = el('table', {}, w);
      b.rows.forEach(r => { const tr = el('tr', {}, t); r.forEach(c => el('td', {}, tr, c.replace(/^\[(Enunciado|Voto|Relatório|Acórdão|Sumário)\]\s*/, '<span class="tag">$1</span> '))); });
    }
  }
  root.addEventListener('click', e => {
    const f = e.target.closest('sup.fn'); $$('.fnpop').forEach(p => p.remove());
    if (!f) return;
    const txt = sec.notes[f.dataset.n];
    if (!txt) return;
    const p = el('div', { class: 'fnpop', role: 'note' }, document.body, `<b>${f.dataset.n}.</b> ${txt}`);
    const r = f.getBoundingClientRect();
    p.style.top = (scrollY + r.bottom + 8) + 'px';
    p.style.left = Math.max(12, Math.min(innerWidth - 380, scrollX + r.left - 20)) + 'px';
    e.stopPropagation();
  });
}
document.addEventListener('click', () => $$('.fnpop').forEach(p => p.remove()));
function highlight(root, q) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
  for (const n of nodes) {
    const t = n.nodeValue, nt = norm(t); let i = nt.indexOf(q);
    if (i < 0 || n.parentNode.closest('.toolbar')) continue;
    const frag = document.createDocumentFragment(); let last = 0;
    while (i >= 0) { frag.append(t.slice(last, i)); const m = document.createElement('mark'); m.textContent = t.slice(i, i + q.length); frag.append(m); last = i + q.length; i = nt.indexOf(q, last); }
    frag.append(t.slice(last)); n.replaceWith(frag);
  }
  root.querySelector('mark')?.scrollIntoView({ block: 'center' });
}

// abre direto numa seção se o endereço tiver #s-x.y
if (location.hash.startsWith('#s-')) openSection(decodeURIComponent(location.hash.slice(3)));
else if (location.hash === '#texto') setTab(true);
