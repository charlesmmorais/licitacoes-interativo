import { kit, lab, el, C, sorter, note, s, ink } from './kit.js';

/* ---------- 2a: governança ---------- */
function govScene(api, mark) {
  const k = kit(api);
  k.script(mark, [
    [0, 0, () => {
      k.box(40, 70, 170, 70, 'Sociedade', { sub: 'principal: cidadãos e usuários' });
      k.box(590, 70, 170, 70, 'Gestão', { sub: 'agentes públicos' });
      const p = k.arrow('M214 95 L586 95', { delay: 500 });
      k.label(400, 85, 'recursos e autoridade', { delay: 800 });
      k.at(1200, () => k.flow(p, { n: 3, speed: .14 }));
    }],
    [2000, 1, () => {
      const p = k.arrow('M586 122 L214 122', { color: C.warn, delay: 0, dash: '3 6' });
      k.label(400, 142, 'informação (assimétrica)', { color: C.warn, delay: 200 });
    }],
    [3400, 2, () => {
      const names = ['Avaliar', 'Direcionar', 'Monitorar'];
      const pos = [[400, 215], [520, 335], [280, 335]];
      const ring = k.s('circle', { cx: 400, cy: 295, r: 95, fill: 'none', stroke: C.dim, 'stroke-width': 2 });
      ink(ring, { dur: 1200 });
      k.at(800, () => k.flow(ring, { n: 3, speed: .16 }));
      names.forEach((n, i) => k.box(pos[i][0] - 62, pos[i][1] - 22, 124, 44, n, { delay: 300 + i * 250, size: 14 }));
      k.label(400, 300, 'GOVERNANÇA', { size: 13, color: C.glow, weight: 800, delay: 1200 });
    }],
    [5200, 3, () => {
      ['Liderança', 'Estratégia', 'Controle'].forEach((n, i) => k.box(40, 200 + i * 58, 150, 44, n, { delay: i * 200, size: 13, color: C.glow }));
      k.arrow('M192 290 L300 290', { delay: 700 });
      k.label(110, 190, 'mecanismos', { color: C.glow, size: 12, delay: 600 });
    }],
    [6600, 4, () => {
      k.box(615, 240, 150, 80, 'Valor com riscos aceitáveis', { color: C.ok, size: 13 });
      k.arrow('M498 295 L610 280', { delay: 300 });
    }]
  ]);
}

function controlsLab(api) {
  const { L } = lab(api);
  const W = 520, H = 230;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H + 40}`, style: 'width:100%;max-height:300px' }, L);
  const x = v => 40 + v * (W - 60), y = v => H - v * (H - 30);
  const ben = v => 1 - Math.exp(-v * 3.2);           // benefício: cresce rápido e satura
  const cost = v => 0.12 * v + 0.75 * v * v;           // custo: cresce cada vez mais
  const val = v => ben(v) - cost(v);
  const line = (f, color, w = 2.5) => { let d = ''; for (let i = 0; i <= 100; i++) { const v = i / 100; d += (i ? 'L' : 'M') + x(v) + ' ' + y(Math.max(0, f(v)) / 1.05); } const p = s('path', { d, fill: 'none', stroke: color, 'stroke-width': w }, svg); ink(p, { dur: 1400 }); return p; };
  s('line', { x1: 40, y1: H, x2: W - 20, y2: H, stroke: C.dim }, svg);
  s('text', { x: W - 20, y: H + 18, 'text-anchor': 'end', fill: C.pale, 'font-size': 12 }, svg, 'intensidade de controles →');
  line(ben, '#7cc4ff'); line(cost, C.bad); line(val, C.ok, 3.5);
  [['benefício (riscos evitados)', '#7cc4ff', 20], ['custo e burocracia', C.bad, 38], ['valor gerado', C.ok, 56]].forEach(([t, c, yy]) => { s('rect', { x: 50, y: yy - 9, width: 12, height: 4, fill: c }, svg); s('text', { x: 68, y: yy - 4, fill: c, 'font-size': 12 }, svg, t); });
  const dot = s('circle', { r: 8, fill: '#fff', filter: 'url(#glow)' }, svg);
  const vline = s('line', { stroke: 'rgba(255,255,255,.35)', 'stroke-dasharray': '3 4' }, svg);
  const r = el('input', { type: 'range', min: 0, max: 100, value: 8, class: 'range', 'aria-label': 'Intensidade de controles' }, L);
  const out = note(L, '', 'verdict meh');
  const seen = new Set();
  const upd = () => {
    const v = r.value / 100, vv = val(v);
    dot.setAttribute('cx', x(v)); dot.setAttribute('cy', y(Math.max(0, vv) / 1.05));
    vline.setAttribute('x1', x(v)); vline.setAttribute('x2', x(v)); vline.setAttribute('y1', 30); vline.setAttribute('y2', H);
    let msg, zone;
    if (v < .18) { zone = 'low'; msg = '<b>Controle de menos.</b> Pouca supervisão: aumentam as chances de desvios, sobrepreço e contratações desalinhadas da estratégia.'; }
    else if (v < .45) { zone = 'mid'; msg = '<b>Ponto de equilíbrio.</b> Os controles evitam mais prejuízo do que custam. É aqui que a governança gera valor.'; }
    else { zone = 'high'; msg = '<b>Burocracia.</b> Cada novo controle custa mais do que evita. O manual lembra o art. 14 do Decreto-lei 200/1967: controles que custam mais que o risco devem ser eliminados.'; }
    out.innerHTML = msg; out.className = 'verdict ' + (zone === 'mid' ? 'good' : 'meh');
    seen.add(zone); if (seen.size === 3) api.done('Você achou o ponto ótimo!');
  };
  r.oninput = upd; upd();
  note(L, 'Arraste o controle do mínimo ao máximo. Curvas ilustrativas: o formato é o que importa.');
}

/* ---------- 2b: riscos ---------- */
const RISKS = [
  { t: 'Pesquisa de preços com poucas fontes', ev: 'valor estimado acima do mercado', co: 'contratação com sobrepreço' },
  { t: 'Requisitos copiados de outro órgão', ev: 'especificação inadequada à necessidade', co: 'solução que não resolve o problema' },
  { t: 'Exigência de marca sem justificativa', ev: 'restrição indevida à competição', co: 'preço maior e possível anulação' },
  { t: 'Fiscal sem capacitação', ev: 'recebimento de objeto fora do especificado', co: 'pagamento por serviço não prestado' }
];
function riskScene(api, mark) {
  const k = kit(api);
  const r = RISKS[0];
  k.script(mark, [
    [0, 0, () => {
      k.box(30, 60, 220, 80, 'Causa', { sub: r.t, color: C.warn });
      k.box(290, 60, 220, 80, 'Evento de risco', { sub: r.ev, delay: 400 });
      k.box(550, 60, 220, 80, 'Consequência', { sub: r.co, color: C.bad, delay: 800 });
      const a = k.arrow('M252 100 L286 100', { delay: 500 }); const b = k.arrow('M512 100 L546 100', { delay: 900 });
      const p = k.path('M140 100 L660 100', { color: 'transparent', ink: false }); k.at(1500, () => k.flow(p, { n: 2, color: C.warn, speed: .15 }));
    }],
    [2600, 1, () => grid(k, 250, 170, 52)],
    [4200, 2, () => {
      const d = k.s('circle', { cx: 250 + 52 * 1.5, cy: 170 + 52 * 0.5, r: 10, fill: '#fff', filter: 'url(#glow)' });
      d.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${52 * 3}px, ${52 * 0}px)` }], { duration: 1400, fill: 'forwards', easing: 'ease-in-out', delay: 300 });
      k.label(560, 205, 'impacto altíssimo', { anchor: 'start', color: C.bad, delay: 900 });
      k.label(560, 225, 'mesmo pouco provável', { anchor: 'start', color: C.pale, delay: 1000 });
    }],
    [6000, 3, () => k.label(400, 440, 'identificar → analisar → avaliar → tratar → comunicar', { color: C.glow, weight: 700, size: 14 })]
  ]);
}
function grid(k, x0, y0, c) {
  const col = (p, i) => { const v = p * i; return v >= 15 ? 'rgba(255,122,138,.55)' : v >= 8 ? 'rgba(255,200,87,.45)' : v >= 4 ? 'rgba(111,214,255,.25)' : 'rgba(62,224,161,.22)'; };
  for (let p = 1; p <= 5; p++) for (let i = 1; i <= 5; i++) {
    const r = k.s('rect', { x: x0 + (i - 1) * c, y: y0 + (5 - p) * c, width: c - 4, height: c - 4, rx: 6, fill: col(p, i), opacity: 0 });
    r.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: (p + i) * 60, fill: 'forwards' }).effect.target.style.transformBox = 'fill-box';
  }
  k.label(x0 + c * 2.5, y0 + c * 5 + 18, 'impacto →', { size: 12 });
  const t = k.label(x0 - 14, y0 + c * 2.5, 'probabilidade →', { size: 12 }); t.setAttribute('transform', `rotate(-90 ${x0 - 14} ${y0 + c * 2.5})`);
}
function riskLab(api) {
  const { L } = lab(api);
  const row = el('div', { class: 'lab-row' }, L);
  const wrap = el('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start' }, L);
  const svg = s('svg', { viewBox: '0 0 300 300', style: 'width:100%;max-width:330px' }, wrap);
  const ctl = el('div', { style: 'display:grid;gap:10px' }, wrap);
  const c = 54, x0 = 30, y0 = 10;
  const level = v => v >= 15 ? ['Extremo', C.bad, 'Tratar com prioridade: evitar (mudar o plano) ou mitigar já, com responsável e prazo.'] : v >= 8 ? ['Alto', C.warn, 'Mitigar: criar controles preventivos e acompanhar de perto; avaliar compartilhar (ex.: na matriz de riscos do contrato).'] : v >= 4 ? ['Médio', '#7cc4ff', 'Mitigar quando o custo do controle compensar; monitorar.'] : ['Baixo', C.ok, 'Aceitar e monitorar: um controle aqui custaria mais do que o risco.'];
  for (let p = 1; p <= 5; p++) for (let i = 1; i <= 5; i++) s('rect', { x: x0 + (i - 1) * c, y: y0 + (5 - p) * c, width: c - 4, height: c - 4, rx: 6, fill: level(p * i)[1], opacity: .28 }, svg);
  s('text', { x: x0 + c * 2.5, y: 296, fill: C.pale, 'font-size': 11, 'text-anchor': 'middle' }, svg, 'impacto →');
  s('text', { x: 12, y: y0 + c * 2.5, fill: C.pale, 'font-size': 11, 'text-anchor': 'middle', transform: `rotate(-90 12 ${y0 + c * 2.5})` }, svg, 'probabilidade →');
  const dot = s('circle', { r: 11, fill: '#fff', filter: 'url(#glow)', style: 'transition:all .5s cubic-bezier(.5,1.6,.4,1)' }, svg);
  const sentence = el('div', { class: 'card', style: 'font-size:13.5px' }, ctl);
  const P = el('label', { class: 'field' }, ctl, 'Probabilidade <input type="range" min="1" max="5" value="3" class="range">').querySelector('input');
  const I = el('label', { class: 'field' }, ctl, 'Impacto <input type="range" min="1" max="5" value="3" class="range">').querySelector('input');
  const out = el('div', { class: 'verdict meh' }, ctl);
  let cur = 0; const touched = new Set();
  const upd = () => {
    const p = +P.value, i = +I.value, [n, col, tr] = level(p * i);
    dot.setAttribute('cx', x0 + (i - .5) * c - 2); dot.setAttribute('cy', y0 + (5 - p + .5) * c - 2);
    out.innerHTML = `<span class="pill" style="color:${col};border-color:${col}">nível ${n} · ${p}×${i}=${p * i}</span><br>${tr}`;
  };
  const pick = j => {
    cur = j; const r = RISKS[j];
    [...row.children].forEach((b, k2) => b.classList.toggle('picked', k2 === j));
    sentence.innerHTML = `<b>Causa:</b> ${r.t}<br><b>Evento:</b> ${r.ev}<br><b>Consequência:</b> ${r.co}`;
  };
  RISKS.forEach((r, j) => el('button', { class: 'card', onclick: () => { pick(j); } }, row, r.t));
  [P, I].forEach(x => x.oninput = () => { upd(); touched.add(cur); if (touched.size >= 2) api.done('Riscos avaliados!'); });
  pick(0); upd();
  note(L, 'Escolha um risco, estime probabilidade e impacto. Avalie pelo menos dois. A escala de 5×5 e as faixas são ilustrativas: cada organização define as suas.');
}

/* ---------- 2c: três linhas ---------- */
function linesScene(api, mark) {
  const k = kit(api);
  const xs = [250, 430, 610];
  const names = ['1ª linha', '2ª linha', '3ª linha'];
  const subs = ['quem executa', 'quem apoia e controla dentro do órgão', 'controle externo e órgão central'];
  k.script(mark, [
    [0, 0, () => { k.box(30, 170, 120, 60, 'Contratação', { size: 14 }); }],
    [800, 1, () => xs.forEach((x, i) => {
      k.path(`M${x} 70 L${x} 350`, { color: [C.glow, '#7cc4ff', C.ok][i], w: 6, delay: i * 400 });
      k.label(x, 55, names[i], { color: '#fff', weight: 800, size: 15, delay: i * 400 + 300 });
      k.label(x, 375, subs[i], { size: 11.5, delay: i * 400 + 500 });
    })],
    [3200, 2, () => {
      const ps = [[200, 3], [250, 0], [310, 1], [140, 2]].map(([y, stop]) => ({ p: k.path(`M150 200 C 190 ${y} 220 ${y} ${xs[Math.min(stop, 2)] - 6} ${y}`, { color: 'transparent', ink: false }), stop }));
      const loop = () => ps.forEach(({ p }, i) => k.at(i * 500, () => k.travel(p, { color: [C.warn, C.bad, C.warn, C.bad][i], r: 6 })));
      loop(); k.at(3000, loop);
      k.label(680, 200, 'riscos barrados', { anchor: 'start', size: 12, color: C.warn, delay: 1200 });
    }],
    [6200, 3, () => k.label(400, 425, 'Lei 14.133/2021, art. 169', { family: 'JetBrains Mono, monospace', color: C.glow, size: 12 })]
  ]);
}
function linesLab(api) {
  const { L } = lab(api);
  sorter(L, {
    bins: ['1ª linha', '2ª linha', '3ª linha'],
    items: [
      { t: 'Agente de contratação / pregoeiro', bin: 0 }, { t: 'Fiscal do contrato', bin: 0 }, { t: 'Servidor da área requisitante', bin: 0 },
      { t: 'Autoridade da estrutura de governança do órgão', bin: 0 }, { t: 'Assessoria jurídica do órgão', bin: 1 },
      { t: 'Controle interno do próprio órgão', bin: 1 }, { t: 'CGU (órgão central de controle interno)', bin: 2 }, { t: 'Tribunal de Contas da União', bin: 2 }
    ],
    onAll: () => api.done('Todas as peças no lugar!')
  });
  note(L, 'Clique num cartão e depois na linha de defesa a que ele pertence.');
}

export default [
  {
    id: 'c2-governanca', title: 'Governança: avaliar, direcionar, monitorar', sub: 'Por que controle demais também é um problema.', secs: ['2'],
    narr: [
      'A sociedade (principal) confia recursos e autoridade aos gestores públicos (agentes).',
      'Quem administra sabe mais do que quem é dono do recurso: é o conflito “principal-agente”.',
      'A governança reduz esse conflito com três atividades: avaliar, direcionar e monitorar.',
      'Ela opera por três mecanismos: liderança, estratégia e controle.',
      'O objetivo: contratações que agreguem valor ao negócio da organização, com riscos aceitáveis.'
    ],
    scene: govScene,
    predict: { q: 'Uma organização quer “melhorar a governança das contratações”. Qual meta faz mais sentido?', opts: ['Criar o máximo possível de controles e aprovações', 'Fazer as contratações agregarem valor com riscos aceitáveis, inclusive removendo controles inúteis', 'Delegar tudo à área de compras e não acompanhar mais'], ans: 1 },
    labIntro: 'Quanto controle é o ideal? Arraste e veja o valor gerado.',
    lab: controlsLab,
    reveal: `<p class="quote">“O propósito da governança não é, nem poderia ser, a criação de mais controles e de mais burocracia. Ao contrário, a governança provê formas de descobrir oportunidades de remover controles desnecessários.”</p>
    <p>A Lei 14.133/2021 atribui à <b>alta administração</b> a responsabilidade pela governança das contratações, com processos e estruturas para avaliar, direcionar e monitorar, inclusive gestão de riscos e controles preventivos.</p>
    <p>Entre os objetivos: proposta mais vantajosa (considerando o ciclo de vida), isonomia e justa competição, evitar sobrepreço, inexequibilidade e superfaturamento, incentivar a inovação e o desenvolvimento sustentável.</p>`,
    quiz: [
      { q: 'Quem a Lei 14.133/2021 responsabiliza pela governança das contratações?', opts: ['A alta administração do órgão ou entidade', 'O pregoeiro', 'O Tribunal de Contas da União'], a: 0, why: 'Cap. 2: a Lei atribui à alta administração dos órgãos e entidades a responsabilidade pela governança das contratações.' },
      { q: 'No conflito principal-agente do setor público, quem é o principal?', opts: ['Os gestores públicos', 'Os usuários dos serviços, cidadãos e sociedade', 'Os fornecedores'], a: 1, why: 'Os cidadãos e a sociedade são o principal; os agentes públicos administram recursos que pertencem a eles.' }
    ]
  },
  {
    id: 'c2-riscos', title: 'Gestão de riscos: da causa à consequência', sub: 'Escrever, medir e tratar um risco de contratação.', secs: ['2.2', '1.2'],
    narr: [
      'Um risco bem escrito tem três partes: causa → evento → consequência.',
      'Para priorizar, cruzamos probabilidade e impacto numa matriz.',
      'Atenção às casas de impacto alto: mesmo riscos pouco prováveis podem exigir tratamento.',
      'O ciclo: identificar, analisar, avaliar, tratar e comunicar, em todas as etapas do metaprocesso.'
    ],
    scene: riskScene,
    predict: { q: 'Um risco tem probabilidade baixa, mas impacto altíssimo (ex.: paralisar um serviço essencial). O que fazer?', opts: ['Ignorar, porque é improvável', 'Avaliar e tratar: o nível do risco combina probabilidade e impacto', 'Cancelar a contratação'], ans: 1 },
    labIntro: 'Posicione riscos reais de contratação na matriz e veja o tratamento sugerido.',
    lab: riskLab,
    reveal: `<p>O processo de gestão de riscos “realizado ao longo de todas as etapas do metaprocesso de contratação” consiste em <b>identificação, análise, avaliação, tratamento e comunicação</b> dos riscos ligados ao processo licitatório, à execução contratual e aos resultados pretendidos.</p>
    <p>Por isso, cada capítulo do manual (exceto o 3, que é conceitual) traz um <b>quadro de riscos</b> no formato causa → evento → consequência, que pode servir de base para controles internos.</p>`,
    quiz: [
      { q: 'Em que etapa do metaprocesso deve acontecer a gestão de riscos?', opts: ['Só no planejamento', 'Ao longo de todas as etapas', 'Só depois da assinatura do contrato'], a: 1, why: 'Cap. 3: a gestão de riscos é realizada ao longo de todas as etapas do metaprocesso.' },
      { q: '“Fiscal sem capacitação” é, na estrutura do manual…', opts: ['a causa', 'o evento', 'a consequência'], a: 0, why: 'É o que leva ao evento (receber objeto fora do especificado), que gera a consequência (pagar pelo que não foi entregue).' }
    ]
  },
  {
    id: 'c2-linhas', title: 'As três linhas de defesa', sub: 'Quem barra cada risco antes que ele vire prejuízo.', secs: ['2.6', '2.1'],
    narr: [
      'Cada contratação carrega riscos que precisam ser barrados em algum ponto.',
      'A Lei 14.133/2021 organiza a defesa em três linhas.',
      'Cada linha intercepta parte dos riscos. O ideal é que a maioria pare logo na primeira.',
      'As contratações se submetem a práticas contínuas de gestão de riscos e controle preventivo.'
    ],
    scene: linesScene,
    predict: { q: 'Em qual linha de defesa atua o Tribunal de Contas da União?', opts: ['1ª linha', '2ª linha', '3ª linha'], ans: 2 },
    labIntro: 'Coloque cada ator na sua linha de defesa.',
    lab: linesLab,
    reveal: `<p>Pelo art. 169 da Lei 14.133/2021:</p>
    <p><b>1ª linha:</b> servidores e empregados públicos, agentes de licitação e autoridades que atuam na estrutura de governança do órgão.<br>
    <b>2ª linha:</b> unidades de assessoramento jurídico e de controle interno do próprio órgão.<br>
    <b>3ª linha:</b> órgão central de controle interno da Administração e tribunal de contas.</p>
    <p>O manual (item 2.6) compara essa divisão ao modelo do IIA e mostra como a auditoria interna pode agregar valor à função de contratações.</p>`,
    quiz: [
      { q: 'A assessoria jurídica do próprio órgão fica em qual linha?', opts: ['1ª', '2ª', '3ª'], a: 1, why: 'Art. 169, II: assessoramento jurídico e controle interno do próprio órgão formam a 2ª linha.' },
      { q: 'Quem é responsável por implementar as práticas de gestão de riscos e controle do art. 169?', opts: ['A alta administração', 'Os licitantes', 'O TCU'], a: 0, why: 'Art. 169, § 1º: a implementação é de responsabilidade da alta administração, considerando custos e benefícios.' }
    ]
  }
];
