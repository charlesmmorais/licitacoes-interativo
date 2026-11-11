// Núcleo: utilitários de DOM/SVG, animações de traço, pulsos de luz, ondas da capa e progresso.
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
const NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, parent, html) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) e.setAttribute(k, v);
  }
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
export function s(tag, attrs = {}, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}

export const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const brl = n => 'R$ ' + fmt(n);
export const pct = (n, d = 1) => (n * 100).toLocaleString('pt-BR', { maximumFractionDigits: d }) + '%';

/* ---------- palco SVG ---------- */
export function makeSVG(parent, vb = '0 0 800 450') {
  const svg = s('svg', { viewBox: vb, preserveAspectRatio: 'xMidYMid meet', role: 'img' }, parent);
  const defs = s('defs', {}, svg);
  defs.innerHTML = `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
    <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#b9ecff"/></marker>
    <marker id="ahc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#6fd6ff"/></marker>
    <linearGradient id="gcyan" x1="0" x2="1"><stop offset="0" stop-color="#0b81c4"/><stop offset="1" stop-color="#6fd6ff"/></linearGradient>`;
  return svg;
}

/** Desenha um elemento SVG como traço à mão (stroke-dashoffset). */
export function ink(e, { delay = 0, dur = 900, ease = 'cubic-bezier(.6,.05,.25,1)' } = {}) {
  let L = 0;
  try { L = e.getTotalLength(); } catch { L = 0; }
  if (!L || reduced) { e.style.opacity = 1; return Promise.resolve(); }
  e.style.strokeDasharray = L;
  e.style.strokeDashoffset = L;
  const a = e.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: dur, delay, easing: ease, fill: 'forwards' });
  return a.finished.then(() => { e.style.strokeDasharray = ''; e.style.strokeDashoffset = ''; }).catch(() => {});
}
export function fadeIn(e, { delay = 0, dur = 600, y = 8 } = {}) {
  if (reduced) { e.style.opacity = 1; return Promise.resolve(); }
  e.style.opacity = 0;
  const a = e.animate([{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }], { duration: dur, delay, easing: 'ease-out', fill: 'forwards' });
  return a.finished.catch(() => {});
}

/* ---------- pulsos de luz que percorrem caminhos ---------- */
const flows = new Set();
let rafOn = false;
function loop(t) {
  for (const f of flows) f.step(t);
  if (flows.size) requestAnimationFrame(loop); else rafOn = false;
}
export function pulse(path, { n = 3, speed = 0.12, r = 4, color = '#6fd6ff', parent, loop: lp = true, onEnd, offset = 0 } = {}) {
  const L = path.getTotalLength();
  const g = s('g', {}, parent || path.parentNode);
  const dots = Array.from({ length: n }, (_, i) => {
    const halo = s('circle', { r: r * 2.6, fill: color, opacity: .25, filter: 'url(#glow2)' }, g);
    const c = s('circle', { r, fill: '#fff', filter: 'url(#glow)' }, g);
    c.style.fill = color === '#6fd6ff' ? '#e9fbff' : color;
    return { c, halo, o: i / n };
  });
  let t0 = null, dead = false;
  const f = {
    step(t) {
      if (dead) return;
      if (t0 === null) t0 = t;
      const el = (t - t0) / 1000;
      let alive = false;
      for (const d of dots) {
        let p = (el * speed * 300 / L) + d.o + offset;
        if (!lp && p > 1 + d.o) { d.c.setAttribute('opacity', 0); d.halo.setAttribute('opacity', 0); continue; }
        alive = true;
        p = lp ? p % 1 : Math.min(p - d.o, 1);
        if (p < 0) continue;
        const pt = path.getPointAtLength(p * L);
        d.c.setAttribute('cx', pt.x); d.c.setAttribute('cy', pt.y);
        d.halo.setAttribute('cx', pt.x); d.halo.setAttribute('cy', pt.y);
        const fade = Math.min(1, p * 8, (1 - p) * 8);
        d.c.setAttribute('opacity', fade); d.halo.setAttribute('opacity', .3 * fade);
      }
      if (!alive) { f.stop(); onEnd && onEnd(); }
    },
    stop() { dead = true; flows.delete(f); g.remove(); }
  };
  if (reduced) { return f; }
  flows.add(f);
  if (!rafOn) { rafOn = true; requestAnimationFrame(loop); }
  return f;
}
/** Um único pulso que viaja do começo ao fim do caminho (promessa). */
export function travel(path, opts = {}) {
  return new Promise(res => { if (reduced) return res(); pulse(path, { n: 1, loop: false, speed: .22, ...opts, onEnd: res }); });
}

/* ---------- componentes de desenho ---------- */
export const C = { line: '#b9ecff', dim: 'rgba(185,236,255,.35)', glow: '#6fd6ff', cyan: '#0b81c4', ok: '#3ee0a1', warn: '#ffc857', bad: '#ff7a8a', white: '#ffffff', pale: '#b4c8e0' };

export function box(svg, x, y, w, h, label, { sub, color = C.line, fill = 'rgba(11,26,54,.55)', delay = 0, r = 14, size = 15, cls } = {}) {
  const g = s('g', { class: cls }, svg);
  const rect = s('rect', { x, y, width: w, height: h, rx: r, fill: 'none', stroke: color, 'stroke-width': 2 }, g);
  const bg = s('rect', { x, y, width: w, height: h, rx: r, fill, opacity: 0 }, g);
  g.insertBefore(bg, rect);
  const t = s('text', { x: x + w / 2, y: y + h / 2 + (sub ? -4 : 5), 'text-anchor': 'middle', fill: '#fff', 'font-size': size, 'font-weight': 700, 'font-family': 'Montserrat, sans-serif', opacity: 0 }, g);
  wrapText(t, label, w - 16, size);
  let st;
  if (sub) { st = s('text', { x: x + w / 2, y: y + h / 2 + 16, 'text-anchor': 'middle', fill: C.pale, 'font-size': 11.5, opacity: 0 }, g, sub); }
  ink(rect, { delay, dur: 800 });
  bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: delay + 500, fill: 'forwards' });
  fadeIn(t, { delay: delay + 450, y: 0 }); if (st) fadeIn(st, { delay: delay + 600, y: 0 });
  g.rect = rect; g.bg = bg; g.label = t; g.cx = x + w / 2; g.cy = y + h / 2; g.x = x; g.y = y; g.w = w; g.h = h;
  g.light = (c = C.glow) => { rect.setAttribute('stroke', c); rect.setAttribute('filter', 'url(#glow)'); bg.setAttribute('fill', c === C.glow ? 'rgba(11,129,196,.35)' : c + '33'); };
  g.unlight = () => { rect.setAttribute('stroke', color); rect.removeAttribute('filter'); bg.setAttribute('fill', fill); };
  return g;
}
export function wrapText(t, str, maxW, size = 15) {
  const words = String(str).split(' ');
  const per = Math.max(6, Math.floor(maxW / (size * 0.56)));
  const lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > per && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  const y0 = +t.getAttribute('y') - (lines.length - 1) * size * 0.6;
  t.textContent = '';
  lines.forEach((ln, i) => s('tspan', { x: t.getAttribute('x'), y: y0 + i * size * 1.2 }, t, ln));
}
export function arrow(svg, d, { color = C.dim, w = 2, delay = 0, dur = 800, head = true, dash } = {}) {
  const p = s('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'marker-end': head ? 'url(#ah)' : null, 'stroke-dasharray': dash }, svg);
  if (!dash) ink(p, { delay, dur }); else fadeIn(p, { delay });
  return p;
}
export function label(svg, x, y, str, { size = 13, color = C.pale, anchor = 'middle', weight = 500, delay = 0, family } = {}) {
  const t = s('text', { x, y, fill: color, 'font-size': size, 'text-anchor': anchor, 'font-weight': weight, 'font-family': family }, svg, str);
  fadeIn(t, { delay, y: 4 });
  return t;
}

/* ---------- ícone da bússola (motivo da capa) ---------- */
export function compassSVG(size = 34, spin = false) {
  return `<svg class="compass-badge" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="#fff"/>
    <g class="needle" style="transform-origin:50px 50px;${spin ? 'animation:needle 6s ease-in-out infinite' : ''}">
      <path d="M50 50 L70 26 L58 56 Z" fill="#4476a7"/>
      <path d="M50 50 L30 74 L42 44 Z" fill="#4476a7"/>
      <path d="M70 26 L42 44 L50 50 Z" fill="#1f3767"/>
      <path d="M30 74 L58 56 L50 50 Z" fill="#1f3767"/>
      <circle cx="50" cy="50" r="4.5" fill="#fff"/>
    </g></svg>`;
}
const st = document.createElement('style');
st.textContent = '@keyframes needle{0%,100%{transform:rotate(-8deg)}30%{transform:rotate(14deg)}60%{transform:rotate(-3deg)}}';
document.head.appendChild(st);

/* ---------- ondas da capa (canvas) ---------- */
export function waves(canvas, { layers = 6, alpha = 1 } = {}) {
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);
  const cols = ['rgba(180,200,224,.18)', 'rgba(111,151,195,.22)', 'rgba(74,135,166,.26)', 'rgba(68,118,167,.32)', 'rgba(41,79,126,.42)', 'rgba(31,55,103,.55)', 'rgba(20,42,82,.6)'];
  let t = 0, visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  function frame() {
    if (visible) {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < layers; i++) {
        const base = h * (0.32 + i * 0.1);
        const amp = 26 + i * 9, k = 0.0022 + i * 0.0004, sp = 0.25 + i * 0.07;
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w + 10; x += 10) {
          const y = base + Math.sin(x * k + t * sp + i * 1.7) * amp + Math.sin(x * k * 2.3 - t * sp * .6 + i) * amp * .35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.closePath();
        ctx.globalAlpha = alpha; ctx.fillStyle = cols[i % cols.length]; ctx.fill();
        // fio de luz na crista
        if (i === 1 || i === 3) {
          ctx.beginPath();
          for (let x = 0; x <= w + 10; x += 10) {
            const y = base + Math.sin(x * k + t * sp + i * 1.7) * amp + Math.sin(x * k * 2.3 - t * sp * .6 + i) * amp * .35;
            x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.strokeStyle = 'rgba(185,236,255,.22)'; ctx.lineWidth = 1.2; ctx.stroke();
        }
      }
      if (!reduced) t += 0.012;
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ---------- setas que se ramificam (o "monitor" da capa) ---------- */
export function branchingArrows(svg) {
  const paths = [
    'M200 300 L200 40', 'M200 200 L120 200 L120 150 L40 150', 'M200 230 L300 230 L300 120 L380 120',
    'M200 260 L90 260 L60 230 L20 230', 'M200 180 L260 180 L290 210 L380 210', 'M200 120 L150 120 L150 60 L110 60',
    'M200 270 L250 270 L250 320 L370 320', 'M200 150 L240 150 L240 70 L280 30', 'M200 290 L140 290 L140 330 L30 330'
  ];
  const g = s('g', {}, svg);
  // grade de pontos
  for (let i = 0; i < 70; i++) s('rect', { x: 20 + (i * 53) % 360, y: 20 + Math.floor(i * 53 / 360) * 34 % 330, width: 2, height: 2, fill: 'rgba(185,236,255,.35)' }, g);
  const els = paths.map((d, i) => {
    const p = s('path', { d, fill: 'none', stroke: 'rgba(233,251,255,.85)', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'marker-end': 'url(#ahb)' }, g);
    ink(p, { delay: 300 + i * 180, dur: 1300 });
    return p;
  });
  const defs = svg.querySelector('defs');
  defs.insertAdjacentHTML('beforeend', '<marker id="ahb" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#e9fbff"/></marker>');
  setTimeout(() => els.forEach((p, i) => pulse(p, { n: 2, speed: .1 + (i % 3) * .03, r: 3.5, parent: g })), reduced ? 0 : 2200);
}

/* ---------- progresso (localStorage, tolerante a falhas) ---------- */
const KEY = 'lc-interativo-v1';
export const store = {
  get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
  set(id, val) { try { const d = store.get(); d[id] = { ...(d[id] || {}), ...val }; localStorage.setItem(KEY, JSON.stringify(d)); } catch {} },
  done(id) { return !!store.get()[id]?.done; }
};

/* ---------- efeitos ---------- */
export function burst(x, y, n = 22) {
  if (reduced) return;
  for (let i = 0; i < n; i++) {
    const d = el('div', { class: 'spark' }, document.body);
    const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 120;
    d.style.left = x + 'px'; d.style.top = y + 'px';
    if (i % 3 === 0) d.style.background = '#fff';
    d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px, ${Math.sin(a) * v + 40}px) scale(.2)`, opacity: 0 }], { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' }).finished.then(() => d.remove());
  }
}
let toastEl;
export function toast(msg) {
  toastEl ||= el('div', { class: 'toast', role: 'status' }, document.body);
  toastEl.textContent = msg; toastEl.classList.add('on');
  clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('on'), 2600);
}
