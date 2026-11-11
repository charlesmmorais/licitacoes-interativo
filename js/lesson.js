// Motor das lições: Cena → Preveja → Teste → Entenda → Fixe
import { el, makeSVG, store, burst, toast, $$ } from './core.js';

const STEPS = [
  ['Cena', 'Veja o mecanismo se desenhar'],
  ['Preveja', 'Aposte antes de saber'],
  ['Teste', 'Mexa no simulador'],
  ['Entenda', 'Compare com o manual'],
  ['Fixe', 'Duas perguntas rápidas']
];

export function mountLesson(root, L, idx, { onRead, onDone } = {}) {
  const prog = store.get()[L.id] || {};
  const art = el('article', { class: 'lesson', id: L.id }, root);
  const head = el('header', { class: 'lesson-head' }, art);
  el('div', {}, head, `<div class="idx">LIÇÃO ${String(idx + 1).padStart(2, '0')} · seções ${L.secs.join(', ')}</div><h2>${L.title}</h2><p>${L.sub}</p>`);
  const badge = el('span', { class: 'done-badge' }, head, '✓ concluída');
  badge.style.display = prog.done ? '' : 'none';

  const stepper = el('div', { class: 'stepper', role: 'tablist' }, art);
  const body = el('div', { class: 'lesson-body' }, art);
  const stage = el('div', { class: 'stage' }, body);
  const panel = el('div', { class: 'panel' }, body);

  const state = { step: 0, pred: prog.pred ?? null, labDone: !!prog.done, reached: prog.done ? 4 : 0, cleanup: [] };
  const btns = STEPS.map(([t, d], i) => el('button', { role: 'tab', title: d, onclick: () => go(i) }, stepper, `<span class="d">${i + 1}</span><span class="l">${t}</span>`));

  function refresh() {
    btns.forEach((b, i) => { b.classList.toggle('on', i === state.step); b.classList.toggle('ok', i < state.reached || (i <= state.reached && prog.done)); b.disabled = i > state.reached; });
  }
  function clear() {
    state.cleanup.forEach(f => { try { f(); } catch {} }); state.cleanup = [];
    stage.innerHTML = ''; panel.innerHTML = '';
  }
  const api = {
    svg: (vb) => makeSVG(stage, vb),
    stage, panel,
    onCleanup: f => state.cleanup.push(f),
    done: (msg) => { if (!state.labDone) { state.labDone = true; } nextBtn && (nextBtn.disabled = false); if (msg) toast(msg); },
    get pred() { return state.pred; }
  };
  let nextBtn;
  function actions(label, fn, { disabled = false, glow = true } = {}) {
    const a = el('div', { class: 'actions' }, panel);
    nextBtn = el('button', { class: 'btn ' + (glow ? 'btn-glow' : 'btn-primary'), onclick: fn }, a, label);
    nextBtn.disabled = disabled;
    return a;
  }
  function advance(to) { state.reached = Math.max(state.reached, to); go(to); }

  function go(i) {
    if (i > state.reached) return;
    clear(); state.step = i; refresh();
    [scene, predict, test, reveal, quiz][i]();
    if (i > 0 && art.getBoundingClientRect().top < 0) art.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scene() {
    el('h3', {}, panel, 'Cena');
    const ol = el('ol', { class: 'narr' }, panel);
    const items = L.narr.map(t => el('li', {}, ol, t));
    const mark = k => items.forEach((li, j) => li.classList.toggle('on', j === k));
    const stop = L.scene(api, mark);
    if (typeof stop === 'function') state.cleanup.push(stop);
    actions('Fazer minha previsão →', () => advance(1));
  }

  function predict() {
    el('h3', {}, panel, 'Preveja');
    el('p', {}, panel, L.predict.q);
    el('p', { class: 'muted' }, panel, 'Não há penalidade por errar: a previsão só serve para você comparar depois.');
    const box = el('div', { class: 'opts' }, panel);
    let sel = state.pred;
    const opts = L.predict.opts.map((t, j) => el('button', { class: 'opt' + (sel === j ? ' sel' : ''), onclick: () => { sel = j; opts.forEach((o, k) => o.classList.toggle('sel', k === j)); lock.disabled = false; } }, box, t));
    const a = actions('Travar previsão e testar →', () => { state.pred = sel; store.set(L.id, { pred: sel }); advance(2); }, { disabled: sel === null });
    const lock = a.querySelector('button');
    // palco: cartão gigante com a pergunta
    const svg = api.svg();
    L.predictArt ? L.predictArt(api, svg) : defaultPredictArt(svg, L.predict.q);
  }

  function test() {
    el('h3', {}, panel, 'Teste');
    el('p', {}, panel, L.labIntro);
    const stop = L.lab(api);
    if (typeof stop === 'function') state.cleanup.push(stop);
    actions('Ver a resposta →', () => advance(3), { disabled: !state.labDone });
  }

  function reveal() {
    const ok = state.pred === L.predict.ans;
    el('h3', {}, panel, 'Entenda');
    el('div', { class: 'verdict ' + (ok ? 'good' : 'meh') }, panel,
      (state.pred === null ? '' : ok ? '<b>Sua previsão estava certa.</b> ' : `<b>Você previu:</b> “${L.predict.opts[state.pred]}”. `) +
      `<b>Resposta:</b> ${L.predict.opts[L.predict.ans]}`);
    el('div', {}, panel, L.reveal);
    const r = el('div', { class: 'lab-row' }, panel);
    L.secs.forEach(sn => el('button', { class: 'cite', onclick: () => onRead && onRead(sn) }, r, `📖 Ler ${sn} no texto integral`));
    actions('Fixar o conteúdo →', () => advance(4));
    const svg = api.svg();
    (L.revealArt || L.sceneStatic || ((a) => L.scene(a, () => {})))(api, svg);
  }

  function quiz() {
    el('h3', {}, panel, 'Fixe');
    let k = 0, score = 0;
    const svg = api.svg();
    const host = el('div', {}, panel);
    const show = () => {
      host.innerHTML = '';
      if (k >= L.quiz.length) return finish();
      const Q = L.quiz[k];
      el('p', { class: 'muted' }, host, `Pergunta ${k + 1} de ${L.quiz.length}`);
      el('p', {}, host, `<b>${Q.q}</b>`);
      const box = el('div', { class: 'opts' }, host);
      const os = Q.opts.map((t, j) => el('button', { class: 'opt', onclick: e => {
        os.forEach(o => o.disabled = true);
        os[Q.a].classList.add('right');
        if (j !== Q.a) os[j].classList.add('wrong'); else { score++; burst(e.clientX, e.clientY, 14); }
        el('p', { class: 'muted' }, host, Q.why);
        el('button', { class: 'btn btn-primary', onclick: () => { k++; show(); } }, el('div', { class: 'actions' }, host), k + 1 < L.quiz.length ? 'Próxima →' : 'Concluir lição ✓');
      } }, box, t));
    };
    const finish = () => {
      store.set(L.id, { done: true, quiz: score });
      badge.style.display = '';
      el('div', { class: 'score' }, host, `${score}/${L.quiz.length}`);
      el('p', {}, host, score === L.quiz.length ? 'Gabaritou. Lição concluída!' : 'Lição concluída. Revise a explicação se quiser.');
      const r = art.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 120, 40);
      refresh(); onDone && onDone(L.id);
      const a = el('div', { class: 'actions' }, host);
      el('button', { class: 'btn btn-ghost', onclick: () => go(0) }, a, '↺ Rever a cena');
      const nx = art.nextElementSibling;
      if (nx) el('button', { class: 'btn btn-glow', onclick: () => nx.scrollIntoView({ behavior: 'smooth' }) }, a, 'Próxima lição ↓');
    };
    show();
    trophy(svg);
  }

  refresh();
  // monta a cena só quando a lição aparece na tela (economiza animação)
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); go(prog.done ? 0 : 0); } }, { rootMargin: '120px' });
  io.observe(art);
  return art;
}

import { s, ink, fadeIn, wrapText, pulse } from './core.js';
function defaultPredictArt(svg, q) {
  const g = s('g', {}, svg);
  const c = s('circle', { cx: 400, cy: 200, r: 110, fill: 'none', stroke: '#6fd6ff', 'stroke-width': 2, 'stroke-dasharray': '4 8' }, g);
  c.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 30000, iterations: Infinity }).effect.target.style.transformOrigin = '400px 200px';
  const q1 = s('text', { x: 400, y: 238, 'text-anchor': 'middle', 'font-size': 150, 'font-weight': 800, fill: 'none', stroke: '#b9ecff', 'stroke-width': 2.5, 'font-family': 'Montserrat' }, g, '?');
  fadeIn(q1, { dur: 900 });
  const t = s('text', { x: 400, y: 370, 'text-anchor': 'middle', 'font-size': 17, fill: '#dbe6f3' }, g);
  wrapText(t, 'Pense no que você já sabe. Qual é o seu palpite?', 600, 17);
}
function trophy(svg) {
  const p = s('path', { d: 'M330 120 h140 v40 a70 70 0 0 1 -140 0 z M350 230 h100 M400 230 v-40 M370 270 h60 M330 140 h-30 a25 25 0 0 0 30 40 M470 140 h30 a25 25 0 0 1 -30 40', fill: 'none', stroke: '#b9ecff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  ink(p, { dur: 1600 });
  const orbit = s('circle', { cx: 400, cy: 190, r: 150, fill: 'none', stroke: 'rgba(111,214,255,.2)' }, svg);
  pulse(orbit, { n: 4, speed: .14 });
}
