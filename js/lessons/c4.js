import { kit, lab, el, C, note, s, ink, burst } from './kit.js';
import { brl, pct } from '../core.js';

/* ---------- 4a: ETP ---------- */
const ETP = [
  ['I', 'Descrição da necessidade da contratação', true], ['II', 'Previsão da contratação no PCA', false], ['III', 'Requisitos da contratação', false],
  ['IV', 'Estimativas das quantidades, com memórias de cálculo', true], ['V', 'Levantamento de mercado', false], ['VI', 'Estimativa do valor da contratação', true],
  ['VII', 'Descrição da solução como um todo', false], ['VIII', 'Justificativas para o parcelamento ou não', true], ['IX', 'Demonstrativo dos resultados pretendidos', false],
  ['X', 'Providências prévias ao contrato', false], ['XI', 'Contratações correlatas e/ou interdependentes', false], ['XII', 'Possíveis impactos ambientais', false],
  ['XIII', 'Posicionamento conclusivo sobre a adequação', true]
];
function etpScene(api, mark) {
  const k = kit(api);
  k.script(mark, [
    [0, 0, () => {
      k.path('M250 20 L520 20 L560 60 L560 430 L250 430 Z M520 20 L520 60 L560 60', { color: C.line, w: 2, dur: 1200 });
      k.label(405, 48, 'ESTUDO TÉCNICO PRELIMINAR', { color: '#fff', weight: 800, size: 13 });
    }],
    [1200, 1, () => ETP.forEach(([n, t], i) => {
      const y = 76 + i * 26.5;
      k.label(270, y, n, { anchor: 'start', size: 11, color: C.glow, family: 'JetBrains Mono', delay: i * 120 });
      k.label(306, y, t.length > 38 ? t.slice(0, 36) + '…' : t, { anchor: 'start', size: 11.5, color: C.pale, delay: i * 120 });
    })],
    [3600, 2, () => {
      k.box(30, 150, 180, 70, 'Necessidade', { sub: 'o problema a resolver' });
      k.arrow('M212 185 L246 185');
      k.box(600, 150, 170, 70, 'Termo de referência', { sub: 'a solução escolhida', color: C.ok, size: 13 });
      const a = k.arrow('M562 185 L596 185');
      const p = k.path('M120 185 L685 185', { color: 'transparent', ink: false }); k.flow(p, { n: 2, speed: .14 });
    }],
    [5400, 3, () => k.label(405, 448, 'art. 18, § 1º · Lei 14.133/2021', { size: 11, color: C.glow, family: 'JetBrains Mono' })]
  ]);
}
function etpLab(api) {
  const { L } = lab(api);
  note(L, 'Marque os elementos que você acha que o ETP <b>sempre</b> precisa conter. Depois confira.');
  const grid = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px' }, L);
  const sel = new Set();
  const cards = ETP.map(([n, t], i) => el('button', { class: 'card', style: 'text-align:left', onclick: () => { if (checked) return; sel.has(i) ? sel.delete(i) : sel.add(i); cards[i].classList.toggle('picked'); } }, grid, `<span class="law">${n}</span> ${t}`));
  let checked = false;
  const row = el('div', { class: 'lab-row' }, L);
  const out = el('div', { class: 'verdict meh', style: 'display:none' }, L);
  el('button', { class: 'btn btn-glow', onclick: e => {
    if (checked) return; checked = true;
    let hits = 0;
    ETP.forEach(([, , m], i) => { const c = cards[i]; c.classList.remove('picked'); if (m) { c.classList.add('good'); if (sel.has(i)) hits++; } else if (sel.has(i)) c.classList.add('bad'); else c.classList.add('dim'); });
    const extra = [...sel].filter(i => !ETP[i][2]).length;
    out.style.display = ''; out.innerHTML = `Você acertou <b>${hits} de 5</b> obrigatórios${extra ? ` e marcou ${extra} que não são obrigatórios (mas, se ficarem de fora, a ausência precisa ser justificada)` : ''}.`;
    burst(e.clientX, e.clientY, 18); api.done('Confira os 5 em verde.');
  } }, row, 'Conferir');
}

/* ---------- 4b: pesquisa de preços ---------- */
const QUOTES = [
  { src: 'Painel de Preços (contratação similar)', v: 1890 }, { src: 'Contratação similar de outro órgão', v: 2010 },
  { src: 'Nota fiscal eletrônica', v: 1950 }, { src: 'Site especializado (com data e hora)', v: 2140 },
  { src: 'Fornecedor A (cotação direta)', v: 2080 }, { src: 'Fornecedor B (cotação direta)', v: 6100 },
  { src: 'Fornecedor C (cotação de 9 meses atrás)', v: 1990, old: true }
];
const stats = vs => {
  const a = [...vs].sort((x, y) => x - y), n = a.length; if (!n) return null;
  const mean = a.reduce((s, x) => s + x, 0) / n, med = n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
  const sd = Math.sqrt(a.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, n - 1));
  return { n, mean, med, min: a[0], cv: sd / mean };
};
function precoScene(api, mark) {
  const k = kit(api);
  const X = v => 80 + (v - 1500) / 5000 * 640;
  k.script(mark, [
    [0, 0, () => { k.path(`M60 260 L740 260`, { color: C.line, w: 2 }); [2000, 3000, 4000, 5000, 6000].forEach(v => k.label(X(v), 285, 'R$ ' + v.toLocaleString('pt-BR'), { size: 11 })); }],
    [900, 1, () => QUOTES.forEach((q, i) => { const c = k.s('circle', { cx: X(q.v), cy: 260, r: 0, fill: q.v > 5000 ? C.bad : C.glow, filter: 'url(#glow)' }); c.animate([{ r: 0 }, { r: 8 }], { duration: 400, delay: i * 200, fill: 'forwards' }); })],
    [2800, 2, () => {
      const st = stats(QUOTES.map(q => q.v));
      const m = k.path(`M${X(st.mean)} 150 L${X(st.mean)} 250`, { color: C.warn, w: 3 }); k.label(X(st.mean), 140, `média ${brl(st.mean)}`, { color: C.warn, weight: 700 });
      const d = k.path(`M${X(st.med)} 270 L${X(st.med)} 350`, { color: C.ok, w: 3, delay: 600 }); k.label(X(st.med), 370, `mediana ${brl(st.med)}`, { color: C.ok, weight: 700, delay: 600 });
    }],
    [4800, 3, () => k.label(560, 210, 'um único valor puxa a média', { color: C.bad, size: 13 })]
  ]);
}
function precoLab(api) {
  const { L } = lab(api);
  const svg = s('svg', { viewBox: '0 0 520 90', style: 'width:100%' }, L);
  const X = v => 20 + (v - 1500) / 5000 * 480;
  s('line', { x1: 10, y1: 50, x2: 510, y2: 50, stroke: C.dim }, svg);
  const dots = QUOTES.map(q => s('circle', { cx: X(q.v), cy: 50, r: 7, fill: C.glow, style: 'transition:all .4s' }, svg));
  const mk = s('path', { d: '', stroke: C.ok, 'stroke-width': 3, style: 'transition:all .5s' }, svg);
  const mkT = s('text', { y: 20, fill: C.ok, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700 }, svg);
  const list = el('div', { style: 'display:grid;gap:5px' }, L);
  const inc = QUOTES.map(() => true);
  QUOTES.forEach((q, i) => {
    const r = el('label', { class: 'card', style: 'display:flex;gap:10px;align-items:center;cursor:pointer;padding:7px 10px' }, list, `<input type="checkbox" checked> <span style="flex:1">${q.src}</span><span class="law">${brl(q.v)}</span>`);
    r.querySelector('input').onchange = e => { inc[i] = e.target.checked; r.classList.toggle('dim', !inc[i]); upd(); };
  });
  const mrow = el('div', { class: 'lab-row' }, L, '<span class="hint">Método (IN Seges/ME 65/2021, art. 6º):</span>');
  let method = 'mean';
  const mb = [['mean', 'Média'], ['med', 'Mediana'], ['min', 'Menor valor']].map(([k2, t]) => el('button', { class: 'card' + (k2 === method ? ' picked' : ''), onclick: () => { method = k2; mb.forEach(b => b.classList.toggle('picked', b.textContent === t)); upd(); } }, mrow, t));
  const out = el('div', { class: 'verdict meh' }, L);
  const upd = () => {
    const vs = QUOTES.filter((_, i) => inc[i]).map(q => q.v);
    dots.forEach((d, i) => { d.setAttribute('opacity', inc[i] ? 1 : .15); d.setAttribute('fill', QUOTES[i].v > 5000 ? C.bad : QUOTES[i].old ? C.warn : C.glow); });
    const st = stats(vs);
    if (!st || st.n < 3) { out.className = 'verdict meh'; out.innerHTML = `<b>Só ${st ? st.n : 0} preço(s).</b> O cálculo precisa incidir sobre um conjunto de três ou mais preços.`; mk.setAttribute('d', ''); mkT.textContent = ''; return; }
    const v = st[method];
    mk.setAttribute('d', `M${X(v)} 28 L${X(v)} 72`); mkT.setAttribute('x', X(v)); mkT.textContent = brl(v);
    const warn = [];
    if (inc[5]) warn.push('Há um valor <b>excessivamente elevado</b> (Fornecedor B) que deve ser desconsiderado.');
    if (inc[6]) warn.push('A cotação do Fornecedor C tem <b>mais de 6 meses</b> da divulgação do edital e não serve como pesquisa direta.');
    const good = !inc[5] && !inc[6];
    out.className = 'verdict ' + (good ? 'good' : 'meh');
    out.innerHTML = `Preço estimado: <b>${brl(v)}</b> · ${st.n} preços · coeficiente de variação ${pct(st.cv)}<br>${warn.join('<br>') || 'Amostra saneada: os preços restantes são consistentes entre si.'}`;
    if (good) api.done('Amostra saneada!');
  };
  upd();
  note(L, 'Desmarque o que não deve entrar na pesquisa e compare os três métodos.');
}

/* ---------- 4c: regimes de execução ---------- */
const REG = [
  { n: 'Empreitada por preço unitário', a: 'EPU', who: ['adm', 'adm', 'both', 'ctr'], pay: 'Paga por unidade medida em campo: os quantitativos são referenciais.', risk: 0.25, use: 'Quantitativos com imprecisão intrínseca ou que tendem a mudar (ex.: reformas).' },
  { n: 'Empreitada por preço global', a: 'EPG', who: ['adm', 'adm', 'both', 'ctr'], pay: 'Preço certo e total, pago por etapa concluída (eventograma).', risk: 0.55, use: 'Quantidades definidas com precisão; exige projeto básico bem detalhado.' },
  { n: 'Contratação semi-integrada', a: 'Semi', who: ['adm', 'adm', 'ctr', 'ctr'], pay: 'O contratado faz o projeto executivo e pode propor alterar o básico, com autorização.', risk: 0.7, use: 'Edital traz o projeto básico, indicando onde o contratado pode inovar.' },
  { n: 'Contratação integrada', a: 'Integrada', who: ['adm', 'ctr', 'ctr', 'ctr'], pay: 'O contratado elabora os projetos básico e executivo e executa a obra.', risk: 0.9, use: 'Licitação com base no anteprojeto; o contratado assume os riscos do projeto básico.' }
];
const STAGES = ['Anteprojeto', 'Projeto básico', 'Projeto executivo', 'Execução da obra'];
function regScene(api, mark) {
  const k = kit(api);
  k.script(mark, [
    [0, 0, () => STAGES.forEach((t, i) => { k.box(40 + i * 185, 60, 165, 56, t, { delay: i * 220, size: 14 }); if (i) k.arrow(`M${40 + i * 185 - 18} 88 L${40 + i * 185 - 3} 88`, { delay: i * 220 }); })],
    [1600, 1, () => { k.label(400, 160, 'Quem faz cada etapa muda conforme o regime', { color: '#fff', weight: 700, size: 15 }); }],
    [2800, 2, () => {
      const rows = [['EPU / EPG', 1], ['Semi-integrada', 1], ['Integrada', 0]];
      rows.forEach(([n, admUntil], r) => {
        const y = 200 + r * 70;
        k.label(30, y + 26, n, { anchor: 'start', color: C.pale, size: 12, delay: r * 300 });
        STAGES.forEach((_, i) => {
          const adm = i <= admUntil, both = r === 0 && i === 2;
          const rr = k.s('rect', { x: 140 + i * 160, y, width: 145, height: 40, rx: 10, fill: adm ? 'rgba(111,214,255,.25)' : 'rgba(62,224,161,.22)', stroke: adm ? C.glow : C.ok, opacity: 0 });
          rr.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: r * 300 + i * 120, fill: 'forwards' });
          k.label(140 + i * 160 + 72, y + 25, both ? 'Adm. ou contratado' : adm ? 'Administração' : 'Contratado', { size: 12, color: '#fff', delay: r * 300 + i * 120 });
        });
      });
    }],
    [5200, 3, () => k.label(400, 430, 'Na semi-integrada, o básico é da Administração, mas o contratado pode propor alterá-lo', { size: 12, color: C.warn })]
  ]);
}
function regLab(api) {
  const { L } = lab(api);
  const row = el('div', { class: 'lab-row' }, L);
  const lanes = el('div', { style: 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px' }, L);
  const cells = STAGES.map(t => el('div', { class: 'card', style: 'text-align:center;font-size:12.5px' }, lanes));
  const meter = el('div', {}, L, '<div class="hint">Risco de projeto e quantitativos com o contratado</div><div style="height:14px;border-radius:7px;background:rgba(180,200,224,.15);overflow:hidden"><div class="fill" style="height:100%;width:0;background:linear-gradient(90deg,#3ee0a1,#ffc857,#ff7a8a);transition:width .7s cubic-bezier(.5,1.4,.4,1)"></div></div>');
  const fill = meter.querySelector('.fill');
  const out = el('div', { class: 'verdict good' }, L);
  const seen = new Set();
  const pick = j => {
    const R = REG[j]; [...row.children].forEach((b, i) => b.classList.toggle('picked', i === j));
    cells.forEach((c, i) => { const w = R.who[i], adm = w === 'adm'; c.innerHTML = `<b>${STAGES[i]}</b><br>${w === 'both' ? 'Administração ou contratado' : adm ? 'Administração' : 'Contratado'}`; c.className = 'card ' + (w === 'both' ? '' : adm ? 'picked' : 'good'); c.animate([{ transform: 'scale(.9)' }, { transform: 'none' }], { duration: 300, delay: i * 60 }); });
    fill.style.width = R.risk * 100 + '%';
    out.innerHTML = `<b>${R.n}.</b> ${R.pay}<br><span class="muted">Quando usar: ${R.use}</span>`;
    seen.add(j); if (seen.size >= 3) api.done('Compare os regimes!');
  };
  REG.forEach((R, j) => el('button', { class: 'card', onclick: () => pick(j) }, row, R.a));
  pick(0);
  note(L, 'Clique nos regimes e observe quem elabora cada peça e como o risco se desloca. A barra de risco é ilustrativa.');
}

export default [
  {
    id: 'c4-etp', title: 'O ETP em 13 elementos', sub: 'O que um estudo técnico preliminar não pode deixar de ter.', secs: ['4.1'],
    narr: ['O estudo técnico preliminar (ETP) é o primeiro documento do planejamento.', 'A Lei lista 13 elementos possíveis (art. 18, § 1º).', 'Ele parte da necessidade, compara soluções e entrega a escolhida ao termo de referência.', 'Nem todos são sempre obrigatórios, mas quem omite precisa justificar.'],
    scene: etpScene,
    predict: { q: 'Dos 13 elementos do ETP, quantos são obrigatórios em todo estudo?', opts: ['Todos os 13', '5, e a ausência dos demais deve ser justificada', 'Nenhum: o ETP é opcional'], ans: 1 },
    labIntro: 'Marque os elementos que você acha obrigatórios.',
    lab: etpLab,
    reveal: `<p class="quote">“Os elementos previstos nos incisos I, IV, VI, VIII e XIII do § 1º do art. 18 devem constar obrigatoriamente do ETP, sendo necessário justificar a ausência dos demais.”</p>
    <p>São eles: <b>necessidade</b>, <b>quantidades</b> (com memórias de cálculo), <b>estimativa de valor</b>, <b>justificativa do parcelamento</b> e <b>posicionamento conclusivo</b>. A profundidade de cada elemento depende do caso concreto.</p>`,
    quiz: [
      { q: 'Qual documento compara soluções e qual especifica a escolhida?', opts: ['ETP compara; termo de referência especifica', 'Termo de referência compara; ETP especifica', 'O edital faz as duas coisas'], a: 0, why: 'Cap. 3: as soluções são avaliadas no ETP e a escolhida é especificada no termo de referência.' },
      { q: 'O ETP pode deixar de trazer o levantamento de mercado (inciso V)?', opts: ['Nunca', 'Sim, desde que justifique a ausência', 'Sim, sem justificar nada'], a: 1, why: 'Art. 18, § 2º: os demais elementos podem faltar, com as devidas justificativas.' }
    ]
  },
  {
    id: 'c4-precos', title: 'Pesquisa de preços sem distorção', sub: 'Por que um único orçamento inflado pode estragar a estimativa.', secs: ['4.3.9', '4.3.9.1', '4.3.9.2', '4.3.9.3'],
    narr: ['Cada ponto é um preço coletado para o mesmo item.', 'As fontes variam: painel de preços, contratações similares, notas fiscais, sites e cotações diretas.', 'Repare na média e na mediana com todos os valores.', 'Um preço fora da curva desloca a média, mas quase não mexe na mediana.'],
    scene: precoScene,
    predict: { q: 'Você coletou 7 preços e um deles é três vezes maior que os outros. Que método é menos afetado por ele?', opts: ['Média', 'Mediana', 'Maior valor'], ans: 1 },
    labIntro: 'Saneie a amostra e escolha o método de cálculo.',
    lab: precoLab,
    reveal: `<p class="quote">“Serão utilizados, como métodos para obtenção do preço estimado, a média, a mediana ou o menor dos valores obtidos na pesquisa de preços, desde que o cálculo incida sobre um conjunto de três ou mais preços […], desconsiderados os valores inexequíveis, inconsistentes e os excessivamente elevados.” (IN Seges/ME 65/2021, art. 6º)</p>
    <p>A pesquisa direta exige no mínimo 3 fornecedores, com justificativa da escolha, e orçamentos com até 6 meses de antecedência da divulgação do edital. O manual lembra que, para itens com muitos fornecedores, uma amostra de três preços pode ser diminuta (Acórdão 2.637/2015-TCU-Plenário).</p>`,
    quiz: [
      { q: 'Qual o número mínimo de preços para aplicar média, mediana ou menor valor?', opts: ['1', '3', '10'], a: 1, why: 'IN Seges/ME 65/2021, art. 6º: conjunto de três ou mais preços.' },
      { q: 'Uma cotação de fornecedor feita 9 meses antes do edital pode compor a pesquisa direta?', opts: ['Sim', 'Não: o limite é 6 meses de antecedência'], a: 1, why: 'IN Seges/ME 65/2021, art. 5º, IV.' }
    ]
  },
  {
    id: 'c4-regimes', title: 'Regimes de execução de obras', sub: 'Quem faz o projeto, quem mede, quem assume o risco.', secs: ['4.4.1', '4.4.1.1', '4.4.1.2', '4.4.1.3', '4.4.1.4'],
    narr: ['Uma obra passa por anteprojeto, projeto básico, projeto executivo e execução.', 'O regime de execução define quem cuida de cada etapa.', 'Nas empreitadas, a Administração entrega o projeto básico; na integrada, o contratado faz tudo a partir do anteprojeto.', 'Na semi-integrada, o básico vem da Administração, mas pode ser alterado com autorização.'],
    scene: regScene,
    predict: { q: 'Em qual regime o contratado elabora o projeto básico?', opts: ['Empreitada por preço unitário', 'Empreitada por preço global', 'Contratação integrada', 'Contratação semi-integrada'], ans: 2 },
    labIntro: 'Troque de regime e veja quem faz o quê.',
    lab: regLab,
    reveal: `<p><b>EPU:</b> preço certo de unidades determinadas. Indicada quando os quantitativos têm imprecisão intrínseca, como em reformas. Retira do contratado boa parte do risco de quantidades.</p>
    <p><b>EPG:</b> preço certo e total, pago por marcos de um eventograma. Exige projeto que permita levantar quantitativos com elevada acurácia.</p>
    <p><b>Integrada:</b> a licitação usa o anteprojeto e o contratado assume integralmente os riscos do projeto básico. <b>Semi-integrada:</b> o projeto básico consta do edital e pode ser alterado mediante autorização, se demonstrada a superioridade das inovações.</p>`,
    quiz: [
      { q: 'Uma reforma com quantitativos difíceis de prever combina mais com…', opts: ['Empreitada por preço unitário', 'Empreitada por preço global', 'Contratação integrada'], a: 0, why: 'Item 4.4.1.1: a EPU é a mais indicada quando os quantitativos têm relevante imprecisão.' },
      { q: 'Na contratação integrada, a licitação é feita com base em…', opts: ['projeto executivo', 'projeto básico', 'anteprojeto'], a: 2, why: 'Item 4.4.1.3: a Administração licita com base no anteprojeto.' }
    ]
  }
];
