import { kit, lab, el, C, sorter, note, s, ink, burst } from './kit.js';
import { brl, pct } from '../core.js';

/* ---------- 5a: sessão pública ---------- */
function sessaoScene(api, mark) {
  const k = kit(api);
  k.script(mark, [
    [0, 0, () => {
      k.box(320, 30, 160, 56, 'Sistema', { sub: 'sessão pública eletrônica', size: 14 });
      ['Alfa', 'Beta', 'Gama', 'Sua empresa'].forEach((n, i) => {
        const x = 60 + i * 190;
        k.box(x, 300, 140, 52, n, { delay: i * 200, size: 14, color: i === 3 ? C.glow : C.line });
        const p = k.path(`M${x + 70} 298 C ${x + 70} 200, 400 180, 400 90`, { color: C.dim, delay: 400 + i * 200 });
        k.at(1400 + i * 300, () => k.flow(p, { n: 2, speed: .16, r: 3.5 }));
      });
    }],
    [2600, 1, () => {
      const v = [100, 96, 93, 91, 88, 87];
      v.forEach((x, i) => k.label(400 + (i % 2 ? 90 : -90), 130 + i * 24, brl(x * 1000), { color: i === v.length - 1 ? C.ok : C.pale, delay: i * 300, family: 'JetBrains Mono', size: 12 }));
    }],
    [4800, 2, () => { k.box(560, 160, 200, 60, 'Negociação', { sub: 'com o 1º colocado', color: C.warn, size: 14 }); k.arrow('M482 60 C 620 60 660 100 660 156'); }],
    [6400, 3, () => { k.box(40, 160, 200, 60, 'Aceitabilidade', { sub: 'preço e exequibilidade', color: C.ok, size: 14 }); k.arrow('M318 60 C 180 60 140 100 140 156'); }]
  ]);
}
function sessaoLab(api) {
  const { L } = lab(api);
  const orc = 100000, cost = 82000;
  note(L, `Você representa <b>Sua empresa</b>. Valor estimado pela Administração: <b>${brl(orc)}</b>. Seu custo real é ${brl(cost)}: abaixo disso, você teria prejuízo.`);
  const board = el('div', { style: 'display:flex;flex-direction:column;gap:6px' }, L);
  const ctl = el('div', { class: 'lab-row' }, L);
  const inp = el('input', { type: 'number', step: 100, value: 99000, style: 'width:150px', class: 'field', 'aria-label': 'Seu lance' }, ctl);
  inp.style.cssText = 'width:140px;font:inherit;padding:8px 10px;border-radius:10px;border:1.5px solid rgba(180,200,224,.3);background:rgba(5,14,32,.5);color:#fff';
  const bid = el('button', { class: 'btn btn-glow' }, ctl, 'Dar lance');
  const clock = el('span', { class: 'pill warn' }, ctl, '⏱ 30s');
  const log = el('div', { class: 'hint' }, L);
  const bots = [{ n: 'Alfa', v: 104000, floor: 86500 }, { n: 'Beta', v: 101500, floor: 84800 }, { n: 'Gama', v: 108000, floor: 88000 }];
  const me = { n: 'Sua empresa', v: 103000, me: true };
  const all = [...bots, me];
  let t = 30, over = false, timer, total = 0;
  api.onCleanup(() => clearInterval(timer));
  const draw = () => {
    const sorted = [...all].sort((a, b) => a.v - b.v);
    board.innerHTML = '';
    sorted.forEach((x, i) => el('div', { class: 'card' + (i === 0 ? ' good' : '') + (x.me ? ' picked' : ''), style: 'display:flex;justify-content:space-between' }, board, `<span>${i + 1}º ${x.n}</span><span class="law">${brl(x.v)}</span>`));
  };
  const best = () => Math.min(...all.map(x => x.v));
  bid.onclick = () => {
    if (over) return;
    const v = +inp.value;
    if (v >= me.v) { log.textContent = 'O lance precisa ser menor que o seu último lance.'; return; }
    me.v = v; log.textContent = v < cost ? `Atenção: ${brl(v)} está abaixo do seu custo. Ganhar assim pode virar inexecução.` : `Lance registrado: ${brl(v)}.`;
    if (total < 70) t = Math.max(t, 12); draw();
  };
  timer = setInterval(() => {
    if (over) return;
    t--; total++; if (total >= 86) t = Math.min(t, 0); clock.textContent = `⏱ ${Math.max(0, t)}s`;
    if (Math.random() < .55) {
      const b = bots.filter(x => x.v > best() || Math.random() < .2).filter(x => x.v - 500 > x.floor)[0];
      if (b) { b.v = Math.max(b.floor, best() - 300 - Math.round(Math.random() * 1200 / 100) * 100); draw(); }
    }
    if (t <= 0) finish();
  }, 700);
  draw();
  function finish() {
    over = true; clearInterval(timer); bid.disabled = true;
    const sorted = [...all].sort((a, b) => a.v - b.v), w = sorted[0];
    const neg = Math.round(w.v * 0.985 / 10) * 10;
    log.innerHTML = `<b>Etapa de lances encerrada.</b> 1º colocado: ${w.n} com ${brl(w.v)} (${pct(w.v / orc, 1)} do estimado).<br>
      <b>Negociação:</b> o agente de contratação negocia com o 1º colocado, mesmo abaixo do orçamento. Contraproposta: ${brl(neg)}.<br>
      ${w.me && w.v < cost ? '<span class="pill bad">risco</span> Você venceu abaixo do custo: pode ser chamado a demonstrar exequibilidade.' : '<span class="pill ok">ok</span> Em seguida: aceitabilidade da proposta e habilitação do vencedor.'}`;
    api.done('Sessão encerrada!');
  }
}

/* ---------- 5b: dispensa x inexigibilidade ---------- */
function contratScene(api, mark) {
  const k = kit(api);
  k.script(mark, [
    [0, 0, () => { k.box(290, 30, 220, 60, 'A competição é viável?', { size: 14 }); }],
    [1000, 1, () => {
      k.box(40, 170, 220, 70, 'Inexigibilidade', { sub: 'art. 74: competição inviável', color: C.warn, size: 15 });
      k.arrow('M320 92 C 250 120 180 130 150 166'); k.label(220, 120, 'não', { color: C.warn });
    }],
    [2400, 2, () => {
      k.box(290, 170, 220, 70, 'A lei autoriza não licitar?', { size: 13 });
      k.arrow('M400 92 L400 166'); k.label(415, 135, 'sim', { anchor: 'start' });
      k.box(540, 300, 220, 70, 'Dispensa', { sub: 'art. 75: hipóteses taxativas', color: C.ok, size: 15, delay: 400 });
      k.arrow('M480 242 C 560 260 620 270 640 296', { delay: 400 }); k.label(600, 262, 'sim', { delay: 500 });
      k.box(140, 300, 220, 70, 'Licitação', { sub: 'a regra', color: C.glow, size: 15, delay: 700 });
      k.arrow('M330 242 C 290 260 270 270 250 296', { delay: 700 }); k.label(270, 262, 'não', { delay: 800 });
    }],
    [4800, 3, () => k.label(400, 420, 'Dispensa por valor: obras/engenharia < R$ 125.451,15 · demais < R$ 62.725,59', { color: C.glow, size: 13, weight: 700 })]
  ]);
}
function contratLab(api) {
  const { L } = lab(api);
  sorter(L, {
    bins: ['Licitação', 'Dispensa', 'Inexigibilidade'],
    items: [
      { t: 'Software vendido por fornecedor exclusivo, comprovado', bin: 2 },
      { t: 'Show de artista consagrado pela crítica', bin: 2 },
      { t: 'Locação de imóvel cujas características tornam necessária a escolha', bin: 2 },
      { t: 'Material de expediente de R$ 30 mil no exercício', bin: 1 },
      { t: 'Obra emergencial após enchente destruir uma ponte', bin: 1 },
      { t: 'Licitação anterior deserta, mantidas as condições', bin: 1 },
      { t: 'Reforma de prédio de R$ 400 mil', bin: 0 },
      { t: 'Compra de 2.000 notebooks', bin: 0 }
    ],
    onAll: () => api.done('Classificação completa!')
  });
  // calculadora da dispensa por valor
  const box = el('div', { class: 'card', style: 'display:grid;gap:8px' }, L, '<b>Calculadora: dispensa em razão do valor (art. 75, I e II)</b>');
  const row = el('div', { class: 'lab-row' }, box);
  const nat = el('select', {}, el('label', { class: 'field' }, row, 'Natureza'));
  ['Obras, engenharia ou manutenção de veículos', 'Outros serviços e compras'].forEach((t, i) => el('option', { value: i }, nat, t));
  const dbl = el('input', { type: 'checkbox' }, el('label', { class: 'field', style: 'flex-direction:row;display:flex;gap:6px;align-items:center' }, row, 'Consórcio público ou agência executiva '));
  const val = el('input', { type: 'range', min: 0, max: 300000, step: 1000, value: 50000, class: 'range' }, box);
  const out = el('div', {}, box);
  const upd = () => {
    const lim = (nat.value === '0' ? 125451.15 : 62725.59) * (dbl.checked ? 2 : 1), v = +val.value;
    const ok = v < lim;
    out.innerHTML = `Valor no exercício (mesma natureza): <b>${brl(v)}</b> · limite: <b>inferior a ${brl(lim)}</b><br><span class="pill ${ok ? 'ok' : 'bad'}">${ok ? 'cabe dispensa por valor' : 'acima do limite: licitar'}</span>`;
  };
  [nat, dbl, val].forEach(x => x.oninput = upd); nat.onchange = upd; upd();
  note(L, 'Os limites valem por exercício financeiro e por natureza do objeto, na mesma unidade gestora. Valores atualizados citados no manual.');
}

/* ---------- 5c: desempate ---------- */
function desempScene(api, mark) {
  const k = kit(api);
  const crit = ['I · Disputa final', 'II · Desempenho contratual prévio', 'III · Equidade entre homens e mulheres', 'IV · Programa de integridade'];
  k.script(mark, [
    [0, 0, () => {
      [0, 1].forEach(i => { const r = k.s('rect', { x: 300 + i * 120, y: 380, width: 80, height: 0, rx: 8, fill: 'rgba(111,214,255,.35)', stroke: C.glow }); r.animate([{ height: 0, y: 380 }, { height: 140, y: 240 }], { duration: 900, delay: i * 200, fill: 'forwards' }); });
      k.label(400, 225, 'R$ 100.000  =  R$ 100.000', { color: '#fff', weight: 700, family: 'JetBrains Mono', delay: 1000 });
    }],
    [1800, 1, () => crit.forEach((c, i) => { const b = k.box(40, 30 + i * 52, 230, 42, c, { delay: i * 250, size: 12 }); })],
    [4000, 2, () => { k.box(560, 30, 210, 90, 'Preferências', { sub: 'empresas locais, brasileiras, que investem em P&D, que mitigam emissões', size: 13, color: C.warn }); }],
    [5600, 3, () => { k.box(560, 150, 210, 70, 'Empate ficto', { sub: 'ME/EPP até 10% acima (5% no pregão)', color: C.ok, size: 14 }); }]
  ]);
}
function desempLab(api) {
  const { L } = lab(api);
  const row = el('div', { class: 'lab-row' }, L);
  const mod = el('select', {}, el('label', { class: 'field' }, row, 'Modalidade'));
  ['Concorrência', 'Pregão'].forEach((t, i) => el('option', { value: i }, mod, t));
  const best = el('input', { type: 'number', value: 100000, step: 500 }, el('label', { class: 'field' }, row, 'Melhor proposta (empresa de grande porte)'));
  const me = el('input', { type: 'number', value: 107000, step: 500 }, el('label', { class: 'field' }, row, 'Proposta da ME/EPP'));
  const svg = s('svg', { viewBox: '0 0 520 90', style: 'width:100%' }, L);
  const out = el('div', { class: 'verdict' }, L);
  const tried = new Set();
  const upd = () => {
    const b = +best.value, m = +me.value, lim = mod.value === '1' ? .05 : .10, top = b * (1 + lim);
    svg.innerHTML = '';
    const X = v => 20 + (v - b * .9) / (b * .3) * 480;
    s('rect', { x: X(b), y: 30, width: Math.max(0, X(top) - X(b)), height: 30, rx: 6, fill: 'rgba(62,224,161,.25)', stroke: C.ok }, svg);
    s('text', { x: (X(b) + X(top)) / 2, y: 22, fill: C.ok, 'font-size': 12, 'text-anchor': 'middle' }, svg, `faixa de empate ficto (+${lim * 100}%)`);
    [[b, '#fff', 'grande porte'], [m, C.glow, 'ME/EPP']].forEach(([v, c, t]) => { s('circle', { cx: Math.min(510, Math.max(10, X(v))), cy: 45, r: 8, fill: c, filter: 'url(#glow)' }, svg); s('text', { x: Math.min(500, Math.max(20, X(v))), y: 82, fill: c, 'font-size': 11, 'text-anchor': 'middle' }, svg, t); });
    const ficto = m > b && m <= top, wins = m <= b;
    out.className = 'verdict ' + (ficto || wins ? 'good' : 'meh');
    out.innerHTML = wins ? 'A ME/EPP já tem a melhor proposta: vence sem precisar do benefício.' :
      ficto ? `<b>Empate ficto.</b> ${brl(m)} está até ${lim * 100}% acima de ${brl(b)}. A ME/EPP pode apresentar proposta de preço inferior à mais bem classificada e ficar com o objeto (LC 123/2006, arts. 44 e 45).` :
        `Fora da faixa: ${brl(m)} supera ${brl(top)}. Prevalece a melhor proposta.`;
    tried.add(ficto ? 'f' : 'x');
    if (tried.size >= 2) api.done('Você testou as faixas!');
  };
  [mod, best, me].forEach(x => { x.oninput = upd; x.onchange = upd; });
  [best, me].forEach(x => x.style.cssText = 'width:150px;font:inherit;padding:8px 10px;border-radius:10px;border:1.5px solid rgba(180,200,224,.3);background:rgba(5,14,32,.5);color:#fff');
  upd();
  note(L, 'Mude a modalidade e os valores. Com R$ 107 mil, troque concorrência por pregão e veja a ME sair da faixa.');
}

export default [
  {
    id: 'c5-sessao', title: 'Sessão pública: lances e negociação', sub: 'Entre na disputa e veja o que acontece depois do último lance.', secs: ['5.3', '5.4', '5.4.3', '5.4.1'],
    narr: ['Na sessão eletrônica, os licitantes enviam lances pelo sistema.', 'No modo aberto, cada lance público pressiona o preço para baixo.', 'Definido o 1º colocado, o agente de contratação negocia condições mais vantajosas.', 'Depois vêm a análise de aceitabilidade da proposta e a habilitação.'],
    scene: sessaoScene,
    predict: { q: 'Terminados os lances, o vencedor já está abaixo do orçamento. O agente de contratação ainda pode negociar?', opts: ['Não, o último lance é definitivo', 'Sim: a negociação deve ser feita mesmo abaixo do orçado', 'Só se os outros licitantes concordarem'], ans: 1 },
    labIntro: 'Você tem 30 segundos. Dispute com três concorrentes (cada lance seu prolonga o relógio).',
    lab: sessaoLab,
    reveal: `<p>O Acórdão 2622/2021-TCU-Plenário, citado no manual, firmou que “a negociação com o licitante vencedor visando obter melhor proposta para a Administração deve ser realizada mesmo se o valor ofertado for inferior àquele orçado”.</p>
    <p>Após a negociação, a proposta passa pela análise de aceitabilidade. Em obras e serviços de engenharia, propostas abaixo de 75% do orçado têm presunção <b>relativa</b> de inexequibilidade: o licitante deve ter a chance de demonstrar que consegue executar. Abaixo de 85%, pode ser exigida garantia adicional.</p>`,
    quiz: [
      { q: 'Em obras, uma proposta abaixo de 75% do valor orçado é…', opts: ['desclassificada automaticamente, sem diligência', 'presumidamente inexequível, mas o licitante pode demonstrar exequibilidade', 'aceita sem análise'], a: 1, why: 'Item 5.4.1: presunção relativa; é necessário diligenciar.' },
      { q: 'Abaixo de que percentual do orçado pode ser exigida garantia adicional em obras?', opts: ['85%', '50%', '95%'], a: 0, why: 'Item 5.4.4: garantia adicional para propostas inferiores a 85% do valor orçado.' }
    ]
  },
  {
    id: 'c5-direta', title: 'Dispensa ou inexigibilidade?', sub: 'A diferença que decide se dá para não licitar.', secs: ['5.10', '5.10.1', '5.10.2', '5.10.2.1'],
    narr: ['A pergunta-chave: é possível haver competição?', 'Se a competição é inviável, é caso de inexigibilidade (rol exemplificativo do art. 74).', 'Se a competição é possível, a regra é licitar, salvo nas hipóteses de dispensa da lei (art. 75).', 'Uma das dispensas mais comuns é a por valor.'],
    scene: contratScene,
    predict: { q: 'Qual a diferença essencial entre dispensa e inexigibilidade?', opts: ['Nenhuma, são sinônimos', 'Na inexigibilidade a competição é inviável; na dispensa ela seria possível, mas a lei autoriza não licitar', 'A dispensa só vale para obras'], ans: 1 },
    labIntro: 'Classifique os oito casos e use a calculadora da dispensa por valor.',
    lab: contratLab,
    reveal: `<p><b>Inexigibilidade</b> (art. 74): competição inviável. Exemplos: fornecedor exclusivo, artista consagrado, serviços técnicos especializados com notória especialização, credenciamento e imóvel singular.</p>
    <p><b>Dispensa</b> (art. 75): competição possível, mas a lei autoriza a contratação direta em hipóteses específicas. Por valor: abaixo de <b>R$ 125.451,15</b> (obras, engenharia e manutenção de veículos) e de <b>R$ 62.725,59</b> (demais), valores dobrados para consórcios públicos e agências executivas.</p>
    <p>Na emergência ou calamidade (inciso VIII), só cabem parcelas concluídas em até 1 ano da ocorrência, vedadas a prorrogação e a recontratação da mesma empresa com base nesse inciso.</p>`,
    quiz: [
      { q: 'Um contrato emergencial (art. 75, VIII) pode ser prorrogado?', opts: ['Sim, quantas vezes for preciso', 'Não: prazo máximo de 1 ano, vedada a prorrogação', 'Sim, por mais 1 ano'], a: 1, why: 'Item 5.10.2.19.' },
      { q: 'Os limites da dispensa por valor são somados…', opts: ['por contrato isolado', 'por exercício financeiro e por natureza do objeto', 'por mês'], a: 1, why: 'Item 5.10.2.1: aplicáveis em cada exercício e por natureza de objeto.' }
    ]
  },
  {
    id: 'c5-desempate', title: 'Desempate e o benefício da ME/EPP', sub: 'O que acontece quando duas propostas empatam, de verdade ou por ficção legal.', secs: ['5.4.2', '4.5.2.4'],
    narr: ['Duas propostas idênticas: quem vence?', 'O art. 60 lista quatro critérios, aplicados nesta ordem.', 'Persistindo o empate, há preferências sucessivas.', 'Antes de tudo isso, ME e EPP têm direito ao empate ficto.'],
    scene: desempScene,
    predict: { q: 'Numa concorrência, a melhor proposta (empresa grande) é R$ 100 mil e uma ME ofertou R$ 104 mil. O que acontece?', opts: ['A grande vence, porque tem o menor preço', 'Há empate ficto: a ME pode cobrir a oferta', 'As duas são desclassificadas'], ans: 1 },
    labIntro: 'Veja a faixa do empate ficto mudar com a modalidade.',
    lab: desempLab,
    reveal: `<p>Pela LC 123/2006, há empate ficto quando a proposta da ME/EPP é igual ou até <b>10%</b> superior à mais bem classificada (<b>5%</b> no pregão). A ME/EPP pode então apresentar proposta inferior e ficar com o objeto.</p>
    <p>Em empate real, aplicam-se os critérios do art. 60, nesta ordem: <b>disputa final</b>; avaliação do <b>desempenho contratual prévio</b>; ações de <b>equidade entre homens e mulheres</b>; e <b>programa de integridade</b>. Persistindo, há preferência sucessiva para empresas do estado (ou DF), brasileiras, que investem em pesquisa e desenvolvimento no País e que comprovem práticas de mitigação.</p>`,
    quiz: [
      { q: 'No pregão, a faixa do empate ficto é de…', opts: ['10%', '5%', '20%'], a: 1, why: 'Item 5.4.2: 5% no caso de pregão.' },
      { q: 'Qual é o primeiro critério de desempate do art. 60?', opts: ['Sorteio', 'Disputa final entre os empatados', 'Programa de integridade'], a: 1, why: 'Art. 60, I: disputa final, em ato contínuo à classificação.' }
    ]
  }
];
