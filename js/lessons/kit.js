// Kit de desenho para cenas e laboratórios
import { s, el, box, arrow, label, pulse, ink, fadeIn, travel, reduced, C, burst, wrapText } from '../core.js';
export { C, el, s, burst, ink, fadeIn, wrapText };

export function kit(api, vb) {
  const svg = api.svg(vb);
  const timers = [];
  api.onCleanup(() => timers.forEach(clearTimeout));
  const k = {
    svg,
    at: (ms, fn) => timers.push(setTimeout(fn, reduced ? 0 : ms)),
    flow: (p, o = {}) => { const f = pulse(p, { parent: svg, ...o }); api.onCleanup(() => f.stop()); return f; },
    travel: (p, o = {}) => travel(p, { parent: svg, ...o }),
    box: (...a) => box(svg, ...a),
    arrow: (d, o) => arrow(svg, d, o),
    label: (x, y, t, o) => label(svg, x, y, t, o),
    s: (t, a, parent, text) => s(t, a, parent || svg, text),
    path: (d, o = {}) => { const p = s('path', { d, fill: 'none', stroke: o.color || C.dim, 'stroke-width': o.w || 2, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash, opacity: o.opacity }, o.parent || svg); if (o.ink !== false && !o.dash) ink(p, { delay: o.delay || 0, dur: o.dur || 900 }); return p; },
    /** roda narração: [[ms, índiceDaNarração, fn?], ...] */
    script: (mark, steps) => steps.forEach(([ms, i, fn]) => k.at(ms, () => { if (i !== null && i !== undefined) mark(i); fn && fn(); }))
  };
  return k;
}

/** Cria a camada DOM do laboratório sobre o palco. */
export function lab(api, { svgUnder = false, vb } = {}) {
  let k = null;
  if (svgUnder) k = kit(api, vb);
  const L = el('div', { class: 'lab' }, api.stage);
  return { L, k };
}

/** Jogo de classificação: clicar cartão e depois a caixa. */
export function sorter(host, { items, bins, onPlace, onAll, cols = bins.length }) {
  const pool = el('div', { class: 'lab-row' }, host);
  const grid = el('div', { class: 'bins', style: `grid-template-columns:repeat(${cols},minmax(0,1fr))` }, host);
  let picked = null, placed = 0;
  const binEls = bins.map((b, bi) => {
    const d = el('div', { class: 'bin', role: 'button', tabindex: 0 }, grid, `<h4>${b}</h4><div class="items"></div>`);
    const drop = () => {
      if (!picked) return;
      const it = picked; picked = null;
      binEls.forEach(x => x.classList.remove('hot'));
      const ok = it.data.bin === bi;
      if (ok) {
        it.node.classList.remove('picked'); it.node.classList.add('good'); it.node.disabled = true;
        d.querySelector('.items').appendChild(it.node);
        const r = it.node.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 10);
        placed++;
      } else {
        it.node.classList.remove('picked'); it.node.classList.add('bad');
        setTimeout(() => it.node.classList.remove('bad'), 500);
      }
      onPlace && onPlace(it.data, ok, bi);
      if (placed === items.length) onAll && onAll();
    };
    d.addEventListener('click', drop); d.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && drop());
    return d;
  });
  items.slice().sort(() => Math.random() - .5).forEach(data => {
    const node = el('button', { class: 'card' }, pool, data.t);
    const it = { node, data };
    node.addEventListener('click', e => {
      e.stopPropagation();
      if (node.disabled) return;
      pool.querySelectorAll('.card').forEach(c => c.classList.remove('picked'));
      picked = it; node.classList.add('picked');
      binEls.forEach(x => x.classList.add('hot'));
    });
  });
  return { pool, grid };
}

/** Painel de dicas que aparece no lab */
export function note(host, html, cls = 'hint') { return el('div', { class: cls }, host, html); }
