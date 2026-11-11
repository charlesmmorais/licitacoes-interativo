import { kit, lab, el, C, sorter, note, s, ink, burst } from './kit.js';
import { brl, pct } from '../core.js';

/* ---------- 3a: fases ---------- */
const FASES = ['Preparatória', 'Divulgação do edital', 'Propostas e lances', 'Julgamento', 'Habilitação', 'Recursal', 'Homologação'];
function fasesScene(api, mark) {
  const k = kit(api);
  const xs = FASES.map((_, i) => 60 + i * 112);
  const track = k.path(`M${xs[0]} 210 L${xs[6]} 210`, { color: C.dim, w: 3, dur: 1500 });
  const nodes = [];
  k.script(mark, [
    [0, 0, () => FASES.forEach((f, i) => {
      const c = k.s('circle', { cx: xs[i], cy: 210, r: 16, fill: '#0b1a36', stroke: C.line, 'stroke-width': 2, opacity: 0 });
      c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: i * 180, fill: 'forwards' });
      k.label(xs[i], 215, ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i], { size: 11, color: '#fff', weight: 700, delay: i * 180 });
      const t = k.label(xs[i], i % 2 ? 262 : 170, f, { size: 12.5, color: '#fff', weight: 600, delay: i * 180 + 200 });
      nodes.push(c);
    })],
    [1800, 1, () => { const f = k.flow(track, { n: 1, speed: .22, r: 6 }); }],
    [3400, 2, () => { [3, 4].forEach(i => { nodes[i].setAttribute('stroke', C.glow); nodes[i].setAttribute('filter', 'url(#glow)'); }); k.label(xs[3] + 56, 320, 'julga primeiro, habilita depois', { color: C.glow, weight: 700 }); }],
    [5200, 3, () => {
      k.path(`M${xs[4]} 228 C ${xs[4]} 380, ${xs[2]} 380, ${xs[2]} 228`, { color: C.warn, w: 2, dur: 1200 });
      k.label(xs[3], 395, 'inversão: só se prevista no edital e motivada', { color: C.warn, size: 12.5 });
    }]
  ]);
}
function fasesLab(api) {
  const { L } = lab(api);
  const modeRow = el('div', { class: 'lab-row' }, L);
  let inv = false;
  const b1 = el('button', { class: 'card picked' }, modeRow, 'Ordem padrão (julgamento → habilitação)');
  const b2 = el('button', { class: 'card' }, modeRow, 'Inversão de fases (habilitação → julgamento)');
  const go = el('button', { class: 'btn btn-glow' }, modeRow, '▶ Rodar licitação');
  const lanes = el('div', { style: 'display:grid;gap:6px' }, L);
  const out = note(L, '', 'verdict meh'); out.style.display = 'none';
  const ran = new Set();
  b1.onclick = () => { inv = false; b1.classList.add('picked'); b2.classList.remove('picked'); };
  b2.onclick = () => { inv = true; b2.classList.add('picked'); b1.classList.remove('picked'); };
  const firms = ['Alfa', 'Beta', 'Gama', 'Delta', 'Épsilon', 'Zeta'];
  go.onclick = async () => {
    go.disabled = true; lanes.innerHTML = ''; out.style.display = 'none';
    const prices = firms.map(() => Math.round(80 + Math.random() * 40) * 1000);
    const order = firms.map((f, i) => ({ f, p: prices[i], hab: Math.random() > .3 })).sort((a, b) => a.p - b.p);
    order[0].hab = false; // o 1º colocado falha, para mostrar a convocação do seguinte
    order[1].hab = true;
    const rows = order.map(o => { const r = el('div', { class: 'card', style: 'display:flex;justify-content:space-between;gap:8px' }, lanes, `<span>${o.f}</span><span class="law">${brl(o.p)}</span><span class="st pill">aguardando</span>`); return { o, r, st: r.querySelector('.st') }; });
    let docs = 0; const sleep = ms => new Promise(r => setTimeout(r, ms));
    const setSt = (x, t, c) => { x.st.textContent = t; x.st.className = 'st pill ' + c; };
    if (!inv) {
      for (const x of rows) { setSt(x, 'proposta julgada', ''); await sleep(180); }
      for (const x of rows) { docs++; setSt(x, 'analisando habilitação…', 'warn'); x.r.classList.add('picked'); await sleep(700); x.r.classList.remove('picked');
        if (x.o.hab) { setSt(x, 'habilitado · vencedor', 'ok'); x.r.classList.add('good'); break; } else { setSt(x, 'inabilitado', 'bad'); x.r.classList.add('dim'); } }
    } else {
      for (const x of rows) { docs++; setSt(x, x.o.hab ? 'habilitado' : 'inabilitado', x.o.hab ? 'ok' : 'bad'); if (!x.o.hab) x.r.classList.add('dim'); await sleep(420); }
      const win = rows.find(x => x.o.hab); await sleep(300); setSt(win, 'vencedor', 'ok'); win.r.classList.add('good');
    }
    ran.add(inv);
    out.style.display = ''; out.innerHTML = `<b>${docs}</b> conjunto(s) de documentos de habilitação analisados. ${inv ? 'Com a inversão, todos os licitantes passam pela habilitação.' : 'Na ordem padrão, só se analisa a habilitação de quem está à frente; se ele falhar, chama-se o próximo.'}`;
    go.disabled = false;
    if (ran.size === 2) api.done('Compare os dois números!');
  };
  note(L, 'Rode as duas ordens e compare quanto trabalho de análise cada uma gera.');
}

/* ---------- 3b: modalidades ---------- */
const MODS = ['Pregão', 'Concorrência', 'Concurso', 'Leilão', 'Diálogo competitivo'];
function modScene(api, mark) {
  const k = kit(api);
  k.script(mark, [
    [0, 0, () => { k.box(320, 20, 160, 50, 'O que você vai fazer?', { size: 13 }); }],
    [900, 1, () => {
      k.box(40, 120, 200, 56, 'Vender bens', { sub: 'alienação', size: 14 });
      k.box(300, 120, 200, 56, 'Comprar ou contratar', { size: 14, delay: 200 });
      k.box(560, 120, 200, 56, 'Escolher trabalho', { sub: 'técnico, científico, artístico', size: 14, delay: 400 });
      ['M360 72 C 300 95 200 95 140 118', 'M400 72 L400 118', 'M440 72 C 500 95 600 95 660 118'].forEach((d, i) => k.arrow(d, { delay: 300 + i * 200 }));
      k.box(60, 230, 160, 50, 'Leilão', { color: C.ok, delay: 900 }); k.arrow('M140 178 L140 226', { delay: 900 });
      k.box(580, 230, 160, 50, 'Concurso', { color: C.ok, delay: 1100 }); k.arrow('M660 178 L660 226', { delay: 1100 });
    }],
    [3200, 2, () => {
      k.box(280, 215, 240, 50, 'Bem ou serviço comum?', { size: 13 }); k.arrow('M400 178 L400 211');
      k.box(250, 320, 130, 50, 'Pregão', { color: C.ok, delay: 500 }); k.arrow('M360 267 L320 316', { delay: 500 }); k.label(318, 292, 'sim', { delay: 600 });
      k.box(420, 320, 150, 50, 'Concorrência', { color: C.ok, delay: 700 }); k.arrow('M440 267 L490 316', { delay: 700 }); k.label(490, 292, 'não / obra', { delay: 800 });
    }],
    [5200, 3, () => { k.box(600, 320, 170, 60, 'Diálogo competitivo', { sub: 'inovação, solução indefinida', color: C.glow, size: 13 }); k.arrow('M572 345 L596 345'); }]
  ]);
}
function modLab(api) {
  const { L } = lab(api);
  sorter(L, {
    bins: MODS, cols: 5,
    items: [
      { t: '500 notebooks com especificação usual de mercado', bin: 0 },
      { t: 'Serviço de limpeza com padrões objetivos', bin: 0 },
      { t: 'Construção de um hospital', bin: 1 },
      { t: 'Consultoria técnica de natureza intelectual', bin: 1 },
      { t: 'Prêmio para o melhor projeto de monumento', bin: 2 },
      { t: 'Venda de veículos inservíveis', bin: 3 },
      { t: 'Venda de imóvel da União', bin: 3 },
      { t: 'Solução inovadora que a Administração não sabe especificar sozinha', bin: 4 }
    ],
    onAll: () => api.done('Todas as modalidades certas!')
  });
  note(L, 'Clique num caso e depois na modalidade adequada. Errou? O cartão volta.');
}

/* ---------- 3c: técnica e preço ---------- */
const PROPS = [{ n: 'A', nt: 95, p: 1000000 }, { n: 'B', nt: 80, p: 820000 }, { n: 'C', nt: 60, p: 700000 }];
function tpScore(w) {
  const ntMax = Math.max(...PROPS.map(x => x.nt)), pMin = Math.min(...PROPS.map(x => x.p));
  return PROPS.map(x => ({ ...x, f: w * x.nt / ntMax + (1 - w) * pMin / x.p }));
}
function tpScene(api, mark) {
  const k = kit(api);
  k.script(mark, [
    [0, 0, () => {
      k.path('M400 90 L400 330', { color: C.line, w: 3 });
      k.path('M330 340 L470 340', { color: C.line, w: 4 });
      const beam = k.s('g', {});
      k.s('line', { x1: 220, y1: 120, x2: 580, y2: 120, stroke: C.glow, 'stroke-width': 4, 'stroke-linecap': 'round' }, beam);
      k.s('path', { d: 'M180 120 L220 120 L260 220 L180 220 Z M540 120 L580 120 L620 220 L540 220 Z', fill: 'none', stroke: C.dim }, beam);
      k.s('text', { x: 220, y: 250, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 700 }, beam, 'Técnica');
      k.s('text', { x: 580, y: 250, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 700 }, beam, 'Preço');
      beam.style.transformOrigin = '400px 120px';
      beam.animate([{ transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }], { duration: 2600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    }],
    [2200, 1, () => k.label(400, 400, 'Nota final = p × técnica + (1 − p) × preço', { size: 16, color: C.glow, weight: 700, family: 'JetBrains Mono, monospace' })],
    [4000, 2, () => k.label(400, 430, 'p pode chegar a, no máximo, 70% (Lei 14.133/2021, art. 36, § 2º)', { size: 13, color: C.warn })]
  ]);
}
function tpLab(api) {
  const { L } = lab(api);
  const svg = s('svg', { viewBox: '0 0 520 220', style: 'width:100%' }, L);
  const bars = PROPS.map((x, i) => {
    const y = 20 + i * 64;
    s('text', { x: 0, y: y + 22, fill: '#fff', 'font-weight': 800, 'font-size': 18 }, svg, x.n);
    s('text', { x: 24, y: y + 14, fill: C.pale, 'font-size': 11 }, svg, `técnica ${x.nt} · ${brl(x.p)}`);
    s('rect', { x: 24, y: y + 22, width: 440, height: 22, rx: 11, fill: 'rgba(180,200,224,.12)' }, svg);
    const r = s('rect', { x: 24, y: y + 22, width: 0, height: 22, rx: 11, fill: 'url(#gcyan)', style: 'transition:width .6s cubic-bezier(.5,1.4,.4,1)' }, svg);
    const t = s('text', { x: 470, y: y + 38, fill: '#fff', 'font-size': 13, 'font-family': 'JetBrains Mono' }, svg, '');
    const crown = s('text', { x: 500, y: y + 39, 'font-size': 18, opacity: 0, style: 'transition:opacity .4s' }, svg, '★');
    crown.setAttribute('fill', C.warn);
    return { r, t, crown };
  });
  s('defs', {}, svg).innerHTML = '<linearGradient id="gcyan" x1="0" x2="1"><stop offset="0" stop-color="#0b81c4"/><stop offset="1" stop-color="#6fd6ff"/></linearGradient>';
  const lbl = el('label', { class: 'field' }, L, 'Peso da proposta técnica: <b class="law" id="wv"></b><input type="range" min="0" max="70" value="30" class="range">');
  const r = lbl.querySelector('input'), wv = lbl.querySelector('#wv');
  const out = note(L, '', 'verdict meh');
  const winners = new Set();
  const upd = () => {
    const w = r.value / 100, sc = tpScore(w), best = sc.reduce((a, b) => b.f > a.f ? b : a);
    wv.textContent = `${r.value}% técnica · ${100 - r.value}% preço`;
    sc.forEach((x, i) => { bars[i].r.setAttribute('width', 440 * x.f); bars[i].t.textContent = x.f.toFixed(3); bars[i].crown.setAttribute('opacity', x === best ? 1 : 0); });
    out.innerHTML = `Vence a proposta <b>${best.n}</b>. ${best.n === 'C' ? 'Com pouco peso técnico, o preço decide.' : best.n === 'A' ? 'Com peso técnico alto, a qualidade compensa um preço 43% maior.' : 'Equilíbrio: a proposta intermediária leva.'}`;
    if (!winners.has(best.n)) { winners.add(best.n); if (winners.size >= 2) api.done('O vencedor mudou com o peso!'); }
  };
  r.oninput = upd; upd();
  note(L, 'Fórmula ilustrativa: técnica normalizada pela maior nota; preço pelo menor preço ÷ preço ofertado. O edital define a fórmula de cada licitação. O controle para em 70% porque esse é o teto legal.');
}

/* ---------- 3d: modos de disputa ---------- */
function disputaScene(api, mark) {
  const k = kit(api);
  k.script(mark, [
    [0, 0, () => {
      k.label(200, 50, 'ABERTO', { color: '#fff', weight: 800, size: 16 });
      const bars = [300, 270, 255, 236, 228, 219, 214];
      bars.forEach((v, i) => { const r = k.s('rect', { x: 70 + i * 38, y: 380 - v, width: 26, height: v, rx: 5, fill: 'rgba(111,214,255,.35)', stroke: C.glow, opacity: 0 }); r.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 350, fill: 'forwards' }); });
      k.label(200, 410, 'lances públicos e sucessivos', { delay: 2000 });
    }],
    [2800, 1, () => {
      k.label(600, 50, 'FECHADO', { color: '#fff', weight: 800, size: 16 });
      [0, 1, 2].forEach(i => { const g = k.s('g', {}); k.s('rect', { x: 480 + i * 85, y: 170, width: 70, height: 50, rx: 6, fill: 'rgba(11,26,54,.8)', stroke: C.line }, g); k.s('path', { d: `M${480 + i * 85} 170 L${515 + i * 85} 200 L${550 + i * 85} 170`, fill: 'none', stroke: C.line }, g); g.style.opacity = 0; g.animate([{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: i * 250, fill: 'forwards' }); });
      k.label(600, 260, 'propostas em sigilo até a data marcada', { delay: 900 });
    }],
    [5000, 2, () => { k.label(600, 330, 'COMBINADO: os dois, na ordem do edital', { color: C.glow, weight: 700 }); }]
  ]);
}
function disputaLab(api) {
  const { L } = lab(api);
  const crits = ['Menor preço', 'Maior desconto', 'Técnica e preço'];
  const modos = ['Aberto', 'Fechado', 'Combinado (aberto + fechado)'];
  const rule = (c, m) => {
    if (c === 2 && m !== 1) return [false, 'Vedado: com técnica e preço, o modo aberto não pode ser usado (art. 56, § 2º).'];
    if (c < 2 && m === 1) return [false, 'Vedado: o modo fechado isolado não pode ser usado com menor preço ou maior desconto (art. 56, § 1º).'];
    return [true, m === 1 ? 'Permitido: propostas sigilosas até a abertura, como exige a disputa por técnica e preço.' : 'Permitido. Veja a disputa acontecendo ao lado.'];
  };
  let c = 0, m = 0;
  const r1 = el('div', { class: 'lab-row' }, L, '<span class="hint">Critério:</span>');
  const r2 = el('div', { class: 'lab-row' }, L, '<span class="hint">Modo:</span>');
  const cb = crits.map((t, i) => el('button', { class: 'card' + (i === c ? ' picked' : ''), onclick: () => { c = i; cb.forEach((b, j) => b.classList.toggle('picked', j === i)); upd(); } }, r1, t));
  const mb = modos.map((t, i) => el('button', { class: 'card' + (i === m ? ' picked' : ''), onclick: () => { m = i; mb.forEach((b, j) => b.classList.toggle('picked', j === i)); upd(); } }, r2, t));
  const out = el('div', { class: 'verdict' }, L);
  const arena = el('div', { style: 'display:grid;gap:6px' }, L);
  const tried = new Set(); let timer;
  api.onCleanup(() => clearInterval(timer));
  function auction() {
    clearInterval(timer); arena.innerHTML = '';
    const bots = ['Alfa', 'Beta', 'Gama', 'Delta'].map(n => ({ n, v: 100000 + Math.random() * 8000, floor: 78000 + Math.random() * 12000 }));
    const rows = bots.map(b => { const r = el('div', { class: 'card', style: 'display:flex;justify-content:space-between;transition:transform .3s' }, arena); return { b, r }; });
    const draw = () => { const sorted = [...rows].sort((a, b) => a.b.v - b.b.v); sorted.forEach((x, i) => { x.r.style.order = i; x.r.innerHTML = `<span>${i === 0 ? '★ ' : ''}${x.b.n}</span><span class="law">${brl(x.b.v)}</span>`; x.r.classList.toggle('good', i === 0); }); };
    arena.style.display = 'flex'; arena.style.flexDirection = 'column';
    draw(); let ticks = 0;
    timer = setInterval(() => {
      const best = Math.min(...bots.map(b => b.v));
      const cand = bots.filter(b => b.v > best || Math.random() < .3).filter(b => b.v - 600 > b.floor);
      if (!cand.length || ticks++ > 40) { clearInterval(timer); el('div', { class: 'hint' }, arena, m === 2 ? 'Fase aberta encerrada: agora os melhores apresentam lance final fechado.' : 'Encerrada a etapa de lances.'); return; }
      const b = cand[Math.floor(Math.random() * cand.length)];
      b.v = Math.max(b.floor, best - 200 - Math.random() * 1800);
      draw();
    }, 420);
  }
  function upd() {
    const [ok, msg] = rule(c, m);
    out.className = 'verdict ' + (ok ? 'good' : 'meh'); out.innerHTML = (ok ? '✓ ' : '✕ ') + msg;
    clearInterval(timer); arena.innerHTML = '';
    if (ok && m !== 1) auction();
    if (ok && m === 1) arena.innerHTML = '<div class="card">✉ ✉ ✉ Propostas lacradas. Serão abertas juntas na data e hora do edital.</div>';
    tried.add(c + '-' + m); if (tried.size >= 4) api.done('Regras testadas!');
  }
  upd();
  note(L, 'Teste pelo menos quatro combinações de critério e modo.');
}

export default [
  {
    id: 'c3-fases', title: 'As sete fases da licitação', sub: 'Por que a Lei 14.133 julga antes de habilitar.', secs: ['3', '3.1.5'],
    narr: ['O processo licitatório tem sete fases, em sequência (art. 17).', 'Ele começa na fase preparatória e só termina na homologação.', 'A regra é julgar as propostas antes de analisar a habilitação.', 'A inversão é possível, mas excepcional: prevista no edital e motivada, com os benefícios explicados.'],
    scene: fasesScene,
    predict: { q: 'Na regra da Lei 14.133/2021, o que vem primeiro?', opts: ['A habilitação de todos os licitantes, depois o julgamento', 'O julgamento das propostas, depois a habilitação de quem venceu', 'Tanto faz: o agente de contratação escolhe livremente'], ans: 1 },
    labIntro: 'Simule uma licitação com seis empresas nas duas ordens possíveis.',
    lab: fasesLab,
    reveal: `<p>Pela Lei 14.133/2021 (art. 17), as fases são: preparatória; divulgação do edital; apresentação de propostas e lances; julgamento; habilitação; recursal; e homologação.</p>
    <p>A apresentação e o julgamento das propostas <b>antecedem</b> a habilitação. A inversão pode ocorrer “desde que prevista em edital e mediante ato motivado com explicitação dos benefícios decorrentes”.</p>
    <p>Com o julgamento primeiro, os documentos de habilitação são exigidos, em regra, apenas do licitante vencedor. Isso poupa trabalho e acelera o certame.</p>`,
    quiz: [
      { q: 'A inversão de fases (habilitação antes do julgamento) é…', opts: ['sempre proibida', 'possível, se prevista no edital e motivada', 'obrigatória em obras'], a: 1, why: 'Item 3.6.1 e art. 17, § 1º da Lei 14.133/2021.' },
      { q: 'Qual é a última fase do processo licitatório?', opts: ['Recursal', 'Homologação', 'Assinatura do contrato'], a: 1, why: 'A homologação encerra o processo licitatório (art. 17, VII). O contrato já faz parte da formalização.' }
    ]
  },
  {
    id: 'c3-modalidades', title: 'Qual modalidade usar?', sub: 'Cinco modalidades e a pergunta que decide cada uma.', secs: ['3.6', '3.6.1', '3.6.2', '3.6.3', '3.6.4', '3.6.5'],
    narr: ['Tudo começa pelo objetivo da Administração.', 'Vender bens leva ao leilão; escolher trabalho técnico ou artístico com prêmio leva ao concurso.', 'Para comprar ou contratar: se o bem ou serviço é comum, pregão; se não, ou se é obra, concorrência.', 'E quando nem a Administração sabe qual é a solução, existe o diálogo competitivo.'],
    scene: modScene,
    predict: { q: 'Para comprar 500 notebooks com especificação usual de mercado, qual modalidade?', opts: ['Concorrência', 'Pregão', 'Diálogo competitivo', 'Concurso'], ans: 1 },
    labIntro: 'Classifique oito situações reais pela modalidade correta.',
    lab: modLab,
    reveal: `<p><b>Pregão:</b> bens e serviços comuns, “cujos padrões de desempenho e qualidade podem ser objetivamente definidos pelo edital”. Critério de menor preço ou maior desconto. Não serve para serviços técnicos especializados de natureza intelectual nem para obras.</p>
    <p><b>Concorrência:</b> bens e serviços especiais e obras e serviços de engenharia.<br><b>Concurso:</b> trabalho técnico, científico ou artístico, julgado por melhor técnica ou conteúdo artístico, com prêmio.<br><b>Leilão:</b> alienação de imóveis ou de móveis inservíveis ou apreendidos, a quem der o maior lance.<br><b>Diálogo competitivo:</b> objetos inovadores, em que a Administração dialoga com licitantes previamente selecionados para desenvolver alternativas.</p>`,
    quiz: [
      { q: 'É possível usar pregão para licitar uma obra?', opts: ['Sim, sempre', 'Não: a jurisprudência considera irregular; serviços comuns de engenharia, sim', 'Só para obras abaixo de R$ 1 milhão'], a: 1, why: 'Acórdão 980/2018-TCU-Plenário: é irregular o pregão para obra; é permitido para serviços comuns de engenharia.' },
      { q: 'O leilão serve para…', opts: ['comprar bens com o maior desconto', 'alienar bens a quem oferecer o maior lance', 'escolher projetos com prêmio'], a: 1, why: 'Item 3.6.4: leilão é a modalidade para alienação de bens a quem oferecer o maior lance.' }
    ]
  },
  {
    id: 'c3-tecnica-preco', title: 'Técnica e preço na balança', sub: 'Quando a proposta mais barata deixa de vencer.', secs: ['3.4', '3.4.4'],
    narr: ['No critério técnica e preço, duas notas disputam o resultado.', 'A nota final pondera as duas pelo peso definido no edital.', 'A lei limita o peso da proposta técnica a 70%.'],
    scene: tpScene,
    predict: { q: 'Ao subir o peso técnico de 30% para 70%, a proposta mais barata…', opts: ['sempre continua vencendo', 'pode perder para uma tecnicamente melhor', 'é desclassificada automaticamente'], ans: 1 },
    labIntro: 'Três propostas, um controle de peso. Encontre o ponto em que o vencedor muda.',
    lab: tpLab,
    reveal: `<p>No julgamento por técnica e preço, avaliam-se primeiro as propostas técnicas e depois as de preço, com a “proporção máxima de 70% de valoração para a proposta técnica”.</p>
    <p>O critério é usado quando a qualidade técnica acima do mínimo do edital é relevante para o resultado, por exemplo em serviços técnicos especializados de natureza predominantemente intelectual. Nele, o modo de disputa aberto é vedado.</p>`,
    quiz: [
      { q: 'Qual o peso máximo da proposta técnica no critério técnica e preço?', opts: ['50%', '70%', '90%'], a: 1, why: 'Lei 14.133/2021, art. 36, § 2º (veja o item 3.4.4).' },
      { q: 'O pregão admite técnica e preço?', opts: ['Sim', 'Não: no pregão só menor preço ou maior desconto', 'Só no pregão presencial'], a: 1, why: 'Acórdão 2050/2014-TCU-Plenário: o pregão não permite a conjugação de fatores para seleção da proposta.' }
    ]
  },
  {
    id: 'c3-disputa', title: 'Modos de disputa: aberto, fechado, combinado', sub: 'Que modo combina com qual critério.', secs: ['3.5'],
    narr: ['No modo aberto, os licitantes dão lances públicos e sucessivos.', 'No fechado, as propostas ficam em sigilo até a data marcada.', 'No combinado, os dois são usados em sequência, na ordem do edital.'],
    scene: disputaScene,
    predict: { q: 'Com o critério técnica e preço, o modo de disputa aberto é…', opts: ['obrigatório', 'vedado', 'preferencial'], ans: 1 },
    labIntro: 'Combine critério e modo. Quando permitido, assista à disputa.',
    lab: disputaLab,
    reveal: `<p>Pelo art. 56 da Lei 14.133/2021: o modo <b>fechado isolado</b> é vedado nos critérios de menor preço ou maior desconto; e o modo <b>aberto</b> é vedado no critério de técnica e preço.</p>
    <p>No pregão, que só usa menor preço ou maior desconto, sobram o modo aberto e o combinado.</p>`,
    quiz: [
      { q: 'Um pregão pode usar apenas o modo fechado?', opts: ['Sim', 'Não: com menor preço ou maior desconto, o fechado isolado é vedado'], a: 1, why: 'Art. 56, § 1º, citado no item 3.6.1.' },
      { q: 'No modo aberto e fechado, lances manifestamente inexequíveis na etapa aberta devem ser…', opts: ['mantidos até o fim', 'desclassificados pelo pregoeiro', 'ignorados'], a: 1, why: 'Acórdão 2920/2020-TCU-Plenário, citado no item 3.6.1.' }
    ]
  }
];
