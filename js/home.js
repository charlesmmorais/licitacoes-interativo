// Página inicial: capa animada, ciclo didático, mapa dos capítulos e busca no manual inteiro
import { el, $, $$, waves, compassSVG, makeSVG, branchingArrows, s, ink, pulse, fadeIn, reduced } from './core.js';
import { CHAPTERS, icon } from './meta.js';
import { topbar, footer, allLessons, chapterProgress } from './app.js';

topbar(0);
const main = el('main', {}, document.body);

/* ---------- capa ---------- */
const hero = el('section', { class: 'hero' }, main);
waves(el('canvas', { class: 'waves', 'aria-hidden': 'true' }, hero));
const hi = el('div', { class: 'hero-inner' }, hero);
const left = el('div', {}, hi, `
  <span class="edition-pill">5ª edição · versão 3.0 · edição interativa</span>
  <div class="title-lockup">${compassSVG(112, true).replace('class="compass-badge"', 'class="big-compass"')}<h1>Licitações<br>e Contratos</h1></div>
  <div class="sub">Orientações e Jurisprudência do TCU</div>
  <p class="lede">Os seis capítulos do manual em lições que se desenham na sua frente. Em cada uma, você <b>prevê</b>, <b>testa</b> num simulador e só então vê a resposta, com o texto integral do manual a um clique.</p>
  <div class="cta"><a class="btn btn-primary" href="capitulo.html?c=1">Começar pela introdução →</a><a class="btn btn-ghost" href="#mapa">Ver os 6 capítulos</a></div>`);
$$('.edition-pill, .title-lockup, .sub, .lede, .cta', left).forEach((e, i) => fadeIn(e, { delay: 200 + i * 180, y: 18, dur: 900 }));
const mon = el('div', { class: 'monitor', 'aria-hidden': 'true' }, hi);
branchingArrows(makeSVG(mon, '0 0 400 350'));
el('div', { class: 'hero-foot' }, hero, '<span>Projeto educacional independente</span><a class="scroll-hint" href="#ciclo" style="text-decoration:none">↓ role para começar</a>');

/* ---------- ciclo ---------- */
const cyc = el('section', { class: 'sec sec-dark', id: 'ciclo' }, main);
const cw = el('div', { class: 'wrap' }, cyc, `<div class="kicker">Como funciona</div><h2 class="h2">Cada lição tem cinco passos</h2><p class="lead">O formato prever → testar → entender funciona para qualquer conteúdo de causa e efeito. Aqui, ele foi aplicado às regras de licitações e contratos.</p>`);
const grid = el('div', { class: 'cycle' }, cw);
const steps = [
  ['Cena', 'O diagrama se desenha em traço e os fluxos ganham luz, passo a passo.', '<path d="M6 40 C 16 10, 34 10, 48 30"/><circle cx="48" cy="30" r="4"/>'],
  ['Preveja', 'Você aposta numa resposta antes de saber. Errar faz parte e ajuda a lembrar.', '<circle cx="27" cy="27" r="20"/><path d="M21 21 a6 6 0 1 1 8 6 v5 M29 38 v1"/>'],
  ['Teste', 'Um simulador para mexer: arrastar, classificar, dar lances, calcular limites.', '<rect x="8" y="12" width="38" height="30" rx="4"/><path d="M16 34 L24 24 L30 30 L38 20"/>'],
  ['Entenda e fixe', 'A resposta com o trecho do manual, o link para a seção e duas perguntas rápidas.', '<path d="M8 12 H24 a4 4 0 0 1 4 4 V44 a4 4 0 0 0 -4 -4 H8 Z M46 12 H32 a4 4 0 0 0 -4 4 V44 a4 4 0 0 1 4 -4 H46 Z"/>']
];
steps.forEach(([t, d, ic], i) => {
  const c = el('div', { class: 'step' }, grid, `<span class="n">0${i + 1}</span><svg viewBox="0 0 54 54" fill="none" stroke="#6fd6ff" stroke-width="2.2" stroke-linecap="round">${ic}</svg><b>${t}</b><p>${d}</p>`);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fadeIn(c, { delay: i * 150, y: 24 }); $$('path,circle,rect', c).forEach(p => ink(p, { delay: i * 150 + 200, dur: 1200 })); } });
  c.style.opacity = 0; io.observe(c);
});

/* ---------- mapa dos capítulos ---------- */
const map = el('section', { class: 'sec sec-blue', id: 'mapa' }, main);
const mw = el('div', { class: 'wrap' }, map, `<div class="kicker">A jornada</div><h2 class="h2">Seis capítulos, um caminho</h2><p class="lead">Governança por cima, conceitos no meio, e o metaprocesso de ponta a ponta: planejar, selecionar e gerir. Cada capítulo traz lições interativas e o texto integral, com notas de rodapé, quadros de jurisprudência e figuras.</p>`);
const jr = el('div', { class: 'journey' }, mw);
const pathSvg = s('svg', { class: 'path', 'aria-hidden': 'true', preserveAspectRatio: 'none' }, jr);
const st = el('div', { class: 'stations' }, jr);
const cards = CHAPTERS.map(c => el('a', { class: 'station', href: `capitulo.html?c=${c.n}` }, st, `
  <div class="num">${c.n}</div>${icon(c.ico)}<h3>${c.title}</h3><p>${c.tag}</p>
  <div class="meta"><svg class="ring" viewBox="0 0 40 40"><circle class="bg" cx="20" cy="20" r="16"/><circle class="fg" cx="20" cy="20" r="16" stroke-dasharray="100.5" stroke-dashoffset="100.5"/></svg><span class="pm">…</span></div>`));
cards.forEach((c, i) => { c.style.opacity = 0; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fadeIn(c, { delay: i * 120, y: 30, dur: 800 }); } }); io.observe(c); });

// caminho de luz ligando os cartões
function drawPath() {
  pathSvg.innerHTML = '<defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="glow2"><feGaussianBlur stdDeviation="6"/></filter></defs>';
  const R = jr.getBoundingClientRect();
  pathSvg.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`);
  const pts = cards.map(c => { const r = c.getBoundingClientRect(); return [r.left - R.left + r.width / 2, r.top - R.top + r.height / 2]; });
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; d += ` C ${(x0 + x1) / 2} ${y0}, ${(x0 + x1) / 2} ${y1}, ${x1} ${y1}`; }
  const p = s('path', { d, fill: 'none', stroke: 'rgba(111,214,255,.35)', 'stroke-width': 2, 'stroke-dasharray': '2 8' }, pathSvg);
  pulse(p, { n: 4, speed: .35, r: 4, parent: pathSvg });
}
requestAnimationFrame(() => setTimeout(drawPath, 50));
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(drawPath, 200); });

allLessons().then(all => all.forEach((c, i) => {
  const p = chapterProgress(c.lessons);
  cards[i].querySelector('.pm').textContent = `${c.lessons.length} ${c.lessons.length === 1 ? 'lição' : 'lições'} · ${p.done} ${p.done === 1 ? 'feita' : 'feitas'}`;
  cards[i].querySelector('.fg').setAttribute('stroke-dashoffset', 100.5 * (1 - p.p));
}));

/* ---------- busca no manual inteiro ---------- */
const sr = el('section', { class: 'sec sec-dark', id: 'busca' }, main);
const sw = el('div', { class: 'wrap' }, sr, `<div class="kicker">Busca</div><h2 class="h2">Procure no manual inteiro</h2><p class="lead">Mais de mil páginas, 209 seções. Digite um termo (por exemplo: <i>sobrepreço</i>, <i>carona</i>, <i>notória especialização</i>, <i>Súmula 247</i>).</p>`);
const inp = el('input', { type: 'search', placeholder: 'Digite pelo menos 3 letras…', 'aria-label': 'Buscar no manual', style: 'width:100%;max-width:640px;font:inherit;font-size:17px;padding:14px 18px;border-radius:999px;border:1.5px solid rgba(111,214,255,.45);background:rgba(5,14,32,.6);color:#fff;margin-top:10px' }, sw);
const res = el('div', { style: 'display:grid;gap:10px;margin-top:20px;max-width:900px' }, sw);
let corpus = null;
const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
async function loadCorpus() {
  if (corpus) return corpus;
  res.innerHTML = '<p class="hint">Carregando o texto dos 6 capítulos…</p>';
  const parts = await Promise.all(CHAPTERS.map(c => fetch(`data/cap${c.n}.json`).then(r => r.json())));
  corpus = parts.flat().map(sec => { const raw = sec.blocks.map(b => b.h || (b.rows || []).flat().join(' · ')).join(' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'); return { ...sec, raw, n: norm(raw) }; });
  return corpus;
}
let tmr;
inp.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(async () => {
  const q = norm(inp.value.trim()); if (q.length < 3) { res.innerHTML = ''; return; }
  const C = await loadCorpus();
  const hits = C.map(sec => { let c = 0, i = sec.n.indexOf(q); const first = i; while (i >= 0) { c++; i = sec.n.indexOf(q, i + q.length); } return { sec, c, first }; }).filter(h => h.c).sort((a, b) => b.c - a.c);
  res.innerHTML = `<p class="hint">${hits.length} seção(ões) com “${inp.value.trim()}”.</p>`;
  hits.slice(0, 25).forEach(({ sec, c, first }) => {
    const a = Math.max(0, first - 90), snip = sec.raw.slice(a, first + q.length + 130);
    const li = el('a', { class: 'card', href: `capitulo.html?c=${sec.num.split('.')[0]}#s-${sec.num}`, style: 'display:block;text-decoration:none;padding:14px 16px' }, res);
    el('div', {}, li, `<span class="law">${sec.num}</span> <b>${sec.title}</b> <span class="pill">${c}×</span>`);
    const p = el('div', { class: 'hint', style: 'margin-top:6px' }, li); p.textContent = (a ? '…' : '') + snip + '…';
  });
}, 300); });

footer();
