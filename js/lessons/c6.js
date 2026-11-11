import { kit, lab, el, C, sorter, note, s, ink, burst } from './kit.js';
import { brl, pct } from '../core.js';

/* ---------- 6a: recebimento ---------- */
const GATES = [
  ['Fiscal técnico', 'recebimento provisório'],
  ['Fiscal administrativo', 'provisório administrativo'],
  ['Gestor do contrato', 'recebimento definitivo'],
  ['Liquidação e pagamento', 'ordem cronológica']
];
function recScene(api, mark) {
  const k = kit(api);
  const xs = GATES.map((_, i) => 60 + i * 180);
  k.script(mark, [
    [0, 0, () => { k.box(320, 20, 160, 50, 'Entrega do contratado', { size: 13 }); }],
    [900, 1, () => {
      GATES.forEach(([t, sub], i) => { k.box(xs[i], 170, 150, 70, t, { sub, delay: i * 300, size: 14, color: i === 2 ? C.ok : C.line }); if (i) k.arrow(`M${xs[i] - 28} 205 L${xs[i] - 4} 205`, { delay: i * 300 }); });
      k.arrow('M400 72 C 400 120 135 120 135 166', { delay: 300 });
      const p = k.path(`M135 205 L${xs[3] + 75} 205`, { color: 'transparent', ink: false });
      k.at(1600, () => k.flow(p, { n: 2, speed: .14, r: 6 }));
    }],
    [3600, 2, () => { k.path('M135 242 C 135 330 60 330 60 270', { color: C.bad, delay: 0 }); k.label(150, 335, 'rejeição no todo ou em parte', { color: C.bad, anchor: 'start' }); }],
    [5400, 3, () => k.label(400, 410, 'O recebimento não exclui a responsabilidade do contratado pela solidez e pela perfeita execução', { size: 12.5, color: C.warn })]
  ]);
}
function recLab(api) {
  const { L } = lab(api);
  const cases = [
    { t: 'Entrega de 100 cadeiras, todas conforme a especificação; nota fiscal e regularidade fiscal em dia.', ans: [0, 0, 0], why: 'Passou em todas as etapas: cabe o recebimento definitivo e o pagamento.' },
    { t: 'Entrega de 100 notebooks, mas 12 sem o processador exigido no termo de referência.', ans: [1], why: 'Desacordo técnico: o fiscal técnico rejeita no todo ou em parte (art. 140, § 1º).' },
    { t: 'Serviço de limpeza executado conforme o contrato, mas a empresa não comprovou o recolhimento do FGTS dos empregados.', ans: [0, 1], why: 'A parte técnica está ok, mas a fiscalização administrativa barra: obrigações trabalhistas e previdenciárias precisam estar em dia.' }
  ];
  let ci = 0, gi = 0, busy = false;
  const lane = el('div', { style: 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px' }, L);
  const gEls = GATES.slice(0, 3).map(([t, sub]) => el('div', { class: 'card', style: 'text-align:center;font-size:13px' }, lane, `<b>${t}</b><br><span class="hint">${sub}</span>`));
  const caseEl = el('div', { class: 'card', style: 'font-size:15px' }, L);
  const row = el('div', { class: 'lab-row' }, L);
  const yes = el('button', { class: 'btn btn-primary' }, row, '✓ Aceitar');
  const no = el('button', { class: 'btn btn-ghost' }, row, '✕ Rejeitar');
  const out = note(L, '');
  const show = () => {
    gEls.forEach((g, i) => { g.className = 'card' + (i === gi ? ' picked' : ''); });
    caseEl.innerHTML = `<span class="law">Caso ${ci + 1} de ${cases.length}</span><br>${cases[ci].t}<br><span class="hint">Você é: <b>${GATES[gi][0]}</b></span>`;
  };
  const act = rej => {
    if (busy || ci >= cases.length) return;
    const c = cases[ci], expected = c.ans[gi] === 1;
    if (rej !== expected) { out.innerHTML = `<span class="pill bad">reveja</span> ${rej ? 'Nada aqui justifica rejeitar nesta etapa.' : 'Há um problema que esta etapa deveria barrar.'}`; gEls[gi].classList.add('bad'); setTimeout(() => gEls[gi].classList.remove('bad'), 450); return; }
    gEls[gi].className = 'card ' + (rej ? 'bad' : 'good');
    if (rej || gi === 2) {
      out.innerHTML = `<span class="pill ok">certo</span> ${c.why}`;
      ci++; gi = 0;
      if (ci >= cases.length) { yes.disabled = no.disabled = true; caseEl.innerHTML = '<b>Todos os casos analisados.</b>'; api.done('Fiscalização concluída!'); return; }
      busy = true; setTimeout(() => { busy = false; show(); }, 1400);
    } else { gi++; busy = true; setTimeout(() => { busy = false; show(); }, 350); }
  };
  yes.onclick = () => act(false); no.onclick = () => act(true);
  show();
}

/* ---------- 6b: aditivos ---------- */
function aditScene(api, mark) {
  const k = kit(api);
  const gauge = (cx, title, lim, val, col, delay) => {
    const R = 110, a0 = Math.PI, a = v => a0 + Math.PI * Math.min(v / .6, 1);
    const pt = v => [cx + R * Math.cos(a(v)), 300 + R * Math.sin(a(v))];
    k.path(`M${cx - R} 300 A ${R} ${R} 0 0 1 ${cx + R} 300`, { color: C.dim, w: 14, delay });
    const [lx, ly] = pt(lim); k.s('line', { x1: lx, y1: ly - 0, x2: cx + (R + 22) * Math.cos(a(lim)), y2: 300 + (R + 22) * Math.sin(a(lim)), stroke: C.warn, 'stroke-width': 3 });
    k.label(cx + (R + 34) * Math.cos(a(lim)), 300 + (R + 34) * Math.sin(a(lim)), pct(lim, 0), { color: C.warn, weight: 700, delay });
    const [ex, ey] = pt(val);
    k.path(`M${cx - R} 300 A ${R} ${R} 0 0 1 ${ex} ${ey}`, { color: col, w: 14, delay: delay + 600, dur: 1400 });
    k.label(cx, 290, pct(val, 0), { size: 30, color: col, weight: 800, delay: delay + 1600, family: 'Montserrat' });
    k.label(cx, 340, title, { color: '#fff', weight: 700, delay });
  };
  k.script(mark, [
    [0, 0, () => k.label(400, 50, 'Contrato de R$ 1.000.000,00', { size: 20, color: '#fff', weight: 800, family: 'Montserrat' })],
    [1000, 1, () => { gauge(220, 'Acréscimos: +R$ 300 mil', .25, .30, C.bad, 0); gauge(580, 'Supressões: −R$ 100 mil', .25, .10, C.ok, 400); }],
    [4200, 2, () => k.label(400, 400, 'Saldo líquido de +20%? Não vale: cada lado é medido separadamente.', { color: C.warn, weight: 700, size: 14 })],
    [6000, 3, () => k.label(400, 428, 'Reforma de edifício ou equipamento: acréscimos até 50%', { color: C.pale, size: 13 })]
  ]);
}
function aditLab(api) {
  const { L } = lab(api);
  const top = el('div', { class: 'lab-row' }, L);
  const base = el('input', { type: 'number', value: 1000000, step: 10000 }, el('label', { class: 'field' }, top, 'Valor inicial atualizado'));
  const ref = el('input', { type: 'checkbox' }, el('label', { class: 'field', style: 'display:flex;gap:6px;align-items:center' }, top, 'Reforma de edifício/equipamento'));
  base.style.cssText = 'width:160px;font:inherit;padding:8px 10px;border-radius:10px;border:1.5px solid rgba(180,200,224,.3);background:rgba(5,14,32,.5);color:#fff';
  const items = [{ n: 'Item 1 · ampliação de escopo', v: 180000 }, { n: 'Item 2 · serviço novo', v: 120000 }, { n: 'Item 3 · redução de quantidade', v: -100000 }];
  const list = el('div', { style: 'display:grid;gap:6px' }, L);
  const meters = el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px' }, L);
  const out = el('div', { class: 'verdict' }, L);
  const mk = (t) => { const d = el('div', { class: 'card' }, meters, `<div class="hint">${t}</div><div class="v law" style="font-size:20px"></div><div style="height:12px;border-radius:6px;background:rgba(180,200,224,.15);position:relative;overflow:hidden;margin-top:6px"><div class="f" style="height:100%;width:0;transition:width .5s"></div><div class="lim" style="position:absolute;top:0;bottom:0;width:3px;background:#ffc857"></div></div>`); return { v: d.querySelector('.v'), f: d.querySelector('.f'), lim: d.querySelector('.lim') }; };
  const mA = mk('Acréscimos (soma)'), mS = mk('Supressões (soma)');
  const moved = new Set();
  const render = () => {
    list.innerHTML = '';
    items.forEach((it, i) => {
      const r = el('div', { class: 'card', style: 'display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center' }, list, `<span>${it.n}</span><span class="law">${it.v >= 0 ? '+' : '−'}${brl(Math.abs(it.v))}</span>`);
      const rg = el('input', { type: 'range', min: -300000, max: 300000, step: 5000, value: it.v, class: 'range', style: 'grid-column:1/3' }, r);
      rg.oninput = () => { it.v = +rg.value; r.querySelector('.law').textContent = (it.v >= 0 ? '+' : '−') + brl(Math.abs(it.v)); moved.add(i); calc(); };
    });
  };
  const calc = () => {
    const B = +base.value || 1, lim = ref.checked ? .5 : .25;
    const add = items.filter(x => x.v > 0).reduce((s, x) => s + x.v, 0), sup = -items.filter(x => x.v < 0).reduce((s, x) => s + x.v, 0);
    const pa = add / B, ps = sup / B, net = (add - sup) / B;
    const scale = .6;
    [[mA, pa, lim], [mS, ps, .25]].forEach(([m, p, l]) => { m.v.textContent = pct(p); m.f.style.width = Math.min(100, p / scale * 100) + '%'; m.f.style.background = p > l ? C.bad : C.ok; m.lim.style.left = (l / scale * 100) + '%'; });
    const okA = pa <= lim + 1e-9, okS = ps <= .25 + 1e-9;
    out.className = 'verdict ' + (okA && okS ? 'good' : 'meh');
    out.innerHTML = `${okA ? '✓' : '✕'} Acréscimos ${pct(pa)} (limite ${pct(lim, 0)}) · ${okS ? '✓' : '✕'} Supressões ${pct(ps)} (limite 25%)<br>` +
      (!okA && net <= lim ? `<b>Armadilha da compensação:</b> o saldo líquido é ${pct(net)}, dentro do limite, mas compensar acréscimos com supressões de itens distintos é vedado.` : okA && okS ? 'Dentro dos limites do art. 125. Lembre: a alteração não pode transfigurar o objeto (art. 126).' : 'Fora do limite legal para alteração unilateral.');
    if (moved.size >= 2) api.done('Limites testados!');
  };
  base.oninput = calc; ref.onchange = calc;
  render(); calc();
  note(L, 'Arraste os itens (à direita acrescenta, à esquerda suprime) e ligue a opção de reforma.');
}

/* ---------- 6c: equilíbrio ---------- */
function eqScene(api, mark) {
  const k = kit(api);
  let beam;
  k.script(mark, [
    [0, 0, () => {
      k.path('M400 130 L400 360 M330 370 L470 370', { color: C.line, w: 3 });
      beam = k.s('g', {});
      k.s('line', { x1: 200, y1: 130, x2: 600, y2: 130, stroke: C.glow, 'stroke-width': 5, 'stroke-linecap': 'round' }, beam);
      k.s('path', { d: 'M160 130 L240 130 L260 210 L140 210 Z M560 130 L640 130 L660 210 L540 210 Z', fill: 'rgba(11,26,54,.6)', stroke: C.dim }, beam);
      k.s('text', { x: 200, y: 240, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 700 }, beam, 'Encargos');
      k.s('text', { x: 600, y: 240, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 700 }, beam, 'Remuneração');
      beam.style.transformOrigin = '400px 130px';
    }],
    [1600, 1, () => { k.label(200, 70, '⚡ custos sobem', { color: C.bad, weight: 700, size: 15 }); beam.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-9deg)' }], { duration: 900, fill: 'forwards', easing: 'cubic-bezier(.5,1.6,.4,1)' }); }],
    [3400, 2, () => {
      k.label(600, 70, '+ instrumento de reequilíbrio', { color: C.ok, weight: 700, size: 15 });
      beam.animate([{ transform: 'rotate(-9deg)' }, { transform: 'rotate(0)' }], { duration: 1200, delay: 600, fill: 'forwards', easing: 'cubic-bezier(.5,1.6,.4,1)' });
    }],
    [5600, 3, () => ['Reajuste · índice, por apostilamento', 'Repactuação · custos demonstrados', 'Revisão · fato imprevisível'].forEach((t, i) => k.label(400, 405 + i * 18, t, { size: 12.5, color: [C.glow, C.warn, C.ok][i], delay: i * 250 }))]
  ]);
}
function eqLab(api) {
  const { L } = lab(api);
  sorter(L, {
    bins: ['Reajuste', 'Repactuação', 'Revisão (reequilíbrio)', 'Nenhum: risco ordinário'], cols: 2,
    items: [
      { t: 'Um ano da data do orçamento; aplicar o índice previsto no contrato', bin: 0 },
      { t: 'Índice setorial de construção aplicado após a anualidade de uma obra', bin: 0 },
      { t: 'Nova convenção coletiva eleva salários em serviço com dedicação exclusiva de mão de obra', bin: 1 },
      { t: 'Guerra faz o preço de um insumo disparar de forma imprevisível', bin: 2 },
      { t: 'Criação de tributo com repercussão comprovada nos preços', bin: 2 },
      { t: 'Índice do contrato ficou um pouco abaixo dos preços de mercado', bin: 3 }
    ],
    onAll: () => api.done('Balança equilibrada!')
  });
  note(L, 'Clique num evento e depois no instrumento adequado.');
}

export default [
  {
    id: 'c6-recebimento', title: 'Do recebimento ao pagamento', sub: 'Três olhares sobre cada entrega antes de o dinheiro sair.', secs: ['6.1.4', '6.1.5', '6.1.6', '6.1.7'],
    narr: ['O contratado entrega o objeto.', 'Ele passa pela fiscalização técnica, pela administrativa e pelo gestor, que faz o recebimento definitivo; só então vem o pagamento.', 'Em qualquer etapa, o objeto pode ser rejeitado no todo ou em parte.', 'E receber não apaga a responsabilidade do contratado.'],
    scene: recScene,
    predict: { q: 'Quem faz o recebimento definitivo do objeto?', opts: ['O fiscal técnico', 'O gestor do contrato (ou comissão designada)', 'O próprio fornecedor'], ans: 1 },
    labIntro: 'Você vai ocupar cada posto. Aceite ou rejeite cada entrega.',
    lab: recLab,
    reveal: `<p>Pelo art. 140 da Lei 14.133/2021, obras e serviços são recebidos <b>provisoriamente</b> pelo responsável pelo acompanhamento e fiscalização, mediante termo detalhado, e <b>definitivamente</b> por servidor ou comissão designada pela autoridade competente, que comprova o atendimento das exigências contratuais.</p>
    <p>O manual destaca que a Lei 14.133/2021 não fixa prazo máximo para o recebimento definitivo, mas esse prazo deve ser definido no planejamento e ser razoável. O objeto pode ser rejeitado, no todo ou em parte, se estiver em desacordo com o contrato.</p>`,
    quiz: [
      { q: 'O recebimento definitivo exclui a responsabilidade do contratado pela solidez da obra?', opts: ['Sim', 'Não'], a: 1, why: 'Art. 140, § 2º: não exclui a responsabilidade civil pela solidez e segurança nem a ético-profissional pela perfeita execução.' },
      { q: 'A Lei 14.133/2021 fixa prazo máximo para o recebimento definitivo?', opts: ['Sim, 90 dias', 'Não; o prazo deve ser definido no planejamento e ser razoável'], a: 1, why: 'Item 6.1.6.' }
    ]
  },
  {
    id: 'c6-aditivos', title: 'Limites dos aditivos', sub: '25%, 50% e a armadilha da compensação.', secs: ['6.2', '6.2.1'],
    narr: ['Um contrato de R$ 1 milhão recebe alterações.', 'Acréscimos e supressões são medidos cada um contra o seu limite.', 'Não se pode compensar um lado com o outro.', 'Em reforma de edifício ou de equipamento, o limite de acréscimos sobe para 50%.'],
    scene: aditScene,
    predict: { q: 'Contrato de R$ 1 milhão: acrescentam-se R$ 300 mil em itens e suprimem-se R$ 100 mil de outros. Está dentro do limite de 25%?', opts: ['Sim: o saldo líquido é de 20%', 'Não: acréscimos e supressões são calculados separadamente; 30% de acréscimo excede 25%', 'Sim: não há limite para aditivos'], ans: 1 },
    labIntro: 'Mexa nos itens e encontre a armadilha da compensação.',
    lab: aditLab,
    reveal: `<p class="quote">Art. 125: o contratado é obrigado a aceitar, nas mesmas condições contratuais, acréscimos ou supressões de até 25% do valor inicial atualizado do contrato; no caso de reforma de edifício ou de equipamento, o limite para os acréscimos é de 50%.</p>
    <p>O manual registra que “são vedadas as compensações entre acréscimos e supressões entre itens distintos do contrato”. Não é compensação vedada restabelecer quantitativo suprimido antes por restrição orçamentária, nas mesmas condições e preços.</p>`,
    quiz: [
      { q: 'Em reforma de edifício, qual o limite para acréscimos?', opts: ['25%', '50%', '100%'], a: 1, why: 'Art. 125 da Lei 14.133/2021.' },
      { q: 'Uma alteração unilateral pode transformar o objeto do contrato em outro?', opts: ['Sim, se couber nos 25%', 'Não: as alterações não podem transfigurar o objeto'], a: 1, why: 'Art. 126 da Lei 14.133/2021.' }
    ]
  },
  {
    id: 'c6-equilibrio', title: 'A balança do equilíbrio econômico-financeiro', sub: 'Reajuste, repactuação ou revisão: qual instrumento para qual evento.', secs: ['6.2.2.1', '6.2.2.1.1', '6.2.2.1.2', '6.2.2.1.3'],
    narr: ['Todo contrato nasce com encargos e remuneração em equilíbrio.', 'Um evento faz os custos subirem e a balança pende.', 'Um instrumento legal recoloca a balança no lugar.', 'São três instrumentos, cada um para um tipo de evento.'],
    scene: eqScene,
    predict: { q: 'Contrato de limpeza com dedicação exclusiva de mão de obra; nova convenção coletiva aumenta salários. Qual instrumento?', opts: ['Reajuste por índice', 'Repactuação', 'Revisão por fato imprevisível'], ans: 1 },
    labIntro: 'Classifique seis eventos pelo instrumento correto, ou por nenhum.',
    lab: eqLab,
    reveal: `<p><b>Reajuste em sentido estrito:</b> aplicação automática de índice previsto no contrato, que pode ser feita por apostilamento.</p>
    <p><b>Repactuação:</b> exige requerimento do contratado, demonstração analítica do aumento dos custos e negociação. É típica de serviços contínuos com dedicação exclusiva de mão de obra.</p>
    <p><b>Revisão (reequilíbrio):</b> para fatos imprevisíveis ou de consequências incalculáveis. A criação de tributos com repercussão comprovada nos preços também altera os preços contratados (art. 134). Já o mero descolamento entre o índice e o mercado não basta (Acórdão 4072/2020-TCU-Plenário).</p>`,
    quiz: [
      { q: 'O reajuste por índice precisa de termo aditivo?', opts: ['Sim, sempre', 'Não: pode ser feito por apostilamento'], a: 1, why: 'Item 6.2.2.1.2.' },
      { q: 'O índice contratual ficou abaixo dos preços de mercado. Isso, sozinho, justifica reequilíbrio?', opts: ['Sim', 'Não: é situação previsível'], a: 1, why: 'Acórdão 4072/2020-TCU-Plenário, citado no item 6.2.2.1.1.' }
    ]
  }
];
