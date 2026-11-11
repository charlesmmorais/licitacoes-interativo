import { kit, lab, el, C, burst, note } from './kit.js';

function mapa(api, mark) {
  const k = kit(api);
  const frame = k.s('rect', { x: 30, y: 26, width: 740, height: 338, rx: 26, fill: 'none', stroke: C.glow, 'stroke-width': 1.5, 'stroke-dasharray': '6 7', opacity: 0 });
  const gl = k.label(52, 50, 'GOVERNANÇA DAS CONTRATAÇÕES · cap. 2', { anchor: 'start', size: 12, color: C.glow, weight: 700, delay: 99999 });
  const steps = [
    [0, 0, () => { k.box(50, 180, 105, 56, 'Necessidade', { size: 14 }); }],
    [900, 1, () => {
      k.box(180, 170, 140, 76, 'Planejamento', { sub: 'cap. 4', delay: 0 });
      k.box(345, 170, 140, 76, 'Seleção do fornecedor', { sub: 'cap. 5', delay: 250, size: 14 });
      k.box(510, 170, 140, 76, 'Gestão do contrato', { sub: 'cap. 6', delay: 500, size: 14 });
      k.arrow('M157 208 L176 208', { delay: 300 }); k.arrow('M322 208 L341 208', { delay: 550 }); k.arrow('M487 208 L506 208', { delay: 800 });
      k.path('M180 152 L180 142 L650 142 L650 152', { color: C.glow, delay: 900 });
      k.label(415, 132, 'METAPROCESSO DE CONTRATAÇÃO · cap. 3', { size: 12, color: C.glow, weight: 700, delay: 1100 });
    }],
    [2600, 2, () => {
      const r = k.s('rect', { x: 180, y: 284, width: 470, height: 36, rx: 18, fill: 'rgba(255,200,87,.08)', stroke: C.warn, 'stroke-width': 1.5 });
      k.label(415, 307, 'Gestão de riscos — em todas as etapas', { size: 13, color: C.warn, weight: 700 });
      const rp = k.path('M195 302 L635 302', { color: 'transparent', ink: false });
      k.flow(rp, { n: 3, color: C.warn, r: 3, speed: .08 });
      k.box(180, 62, 140, 46, 'PCA', { sub: 'DFD → plano anual', size: 14 });
      k.arrow('M250 110 L250 166', { delay: 400 });
    }],
    [4200, 3, () => {
      frame.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'forwards' });
      gl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 300, fill: 'forwards' });
      const orbit = k.s('rect', { x: 30, y: 26, width: 740, height: 338, rx: 26, fill: 'none', stroke: 'transparent' });
      k.flow(orbit, { n: 5, speed: .2, r: 3 });
    }],
    [5600, 4, () => {
      k.box(675, 180, 88, 56, 'Resultado', { size: 13, color: C.ok });
      k.arrow('M652 208 L671 208');
      const main = k.path('M110 208 L720 208', { color: 'transparent', ink: false });
      k.flow(main, { n: 4, speed: .18, r: 5 });
    }]
  ];
  k.script(mark, steps);
}

export default [{
  id: 'c1-mapa',
  title: 'O mapa do manual',
  sub: 'Como os seis capítulos se encaixam: governança por cima, três processos em sequência e riscos o tempo todo.',
  secs: ['1.2', '3'],
  narr: [
    'Toda contratação nasce de uma necessidade da Administração.',
    'O metaprocesso agrupa três processos de trabalho: planejamento, seleção do fornecedor e gestão do contrato.',
    'Antes dele vem o plano de contratações anual (PCA). E a gestão de riscos acompanha todas as etapas.',
    'Por cima de tudo, a governança avalia, direciona e monitora a função de contratações.',
    'A saída é uma solução que produz resultados e atende à necessidade que deu origem a tudo.'
  ],
  scene: mapa,
  predict: {
    q: 'Uma unidade precisa de 300 cadeiras novas. Dentro do metaprocesso, qual é o primeiro passo?',
    opts: ['Publicar o edital', 'Planejar a contratação (ETP e termo de referência)', 'Escolher o fornecedor mais barato', 'Assinar o contrato'],
    ans: 1
  },
  labIntro: 'Monte a linha do tempo de uma contratação: clique nos cartões na ordem em que acontecem.',
  lab(api) {
    const { L } = lab(api);
    const seq = ['DFD: área requisitante descreve a necessidade', 'PCA: a contratação entra no plano anual', 'ETP: compara soluções possíveis', 'Termo de referência: especifica a solução', 'Edital', 'Propostas e lances', 'Julgamento', 'Habilitação', 'Recursos', 'Homologação', 'Contrato assinado', 'Fiscalização e recebimento'];
    const phase = i => i < 5 ? 'Planejamento' : i < 10 ? 'Seleção' : 'Gestão';
    const track = el('div', { class: 'lab-row', style: 'min-height:46px;align-items:flex-start' }, L);
    note(L, 'Próximo cartão:');
    const pool = el('div', { class: 'lab-row' }, L);
    const status = note(L, '');
    let next = 0;
    seq.map((t, i) => ({ t, i })).sort(() => Math.random() - .5).forEach(({ t, i }) => {
      const b = el('button', { class: 'card' }, pool, t);
      b.onclick = e => {
        if (i === next) {
          b.remove();
          const c = el('div', { class: 'card good' }, track, `<span class="pill ${['ok', 'warn', 'ok'][i < 5 ? 0 : i < 10 ? 1 : 2]}">${phase(i)}</span> ${t}`);
          burst(e.clientX, e.clientY, 10);
          next++;
          status.textContent = next < seq.length ? `${next} de ${seq.length} no lugar.` : '';
          if (next === seq.length) { status.innerHTML = '<b>Linha do tempo completa.</b> Repare: metade dos passos acontece antes de qualquer fornecedor aparecer.'; api.done('Sequência completa!'); }
        } else {
          b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 450);
          status.innerHTML = `Ainda não. Pense no que precisa existir antes de <i>${t.split(':')[0]}</i>.`;
        }
      };
    });
  },
  reveal: `<p>O <b>planejamento</b> vem primeiro e se aproxima da “fase preparatória” da Lei 14.133/2021: recebe a necessidade, compara soluções no <b>estudo técnico preliminar</b> e especifica a escolhida no <b>termo de referência</b>.</p>
  <p>O planejamento nem sempre termina em edital: pode levar a uma contratação direta (dispensa ou inexigibilidade) ou até à conclusão de que a contratação é inviável.</p>
  <p class="quote">“Metaprocesso de contratação pública: agrupamento dos processos de trabalho de planejamento de cada uma das contratações, seleção de fornecedores e gestão de contratos.”</p>`,
  quiz: [
    { q: 'Boa parte da jurisprudência citada no manual foi firmada sob a Lei 8.666/1993. Por que ela aparece?', opts: ['Porque a Lei 8.666/1993 continua valendo para novas contratações', 'Porque os raciocínios dessas decisões podem continuar válidos sob a Lei 14.133/2021', 'Apenas por registro histórico'], a: 1, why: 'Item 1.2: os raciocínios subjacentes ainda podem ser válidos e aplicáveis às contratações regidas pela Lei 14.133/2021.' },
    { q: 'O manual cobre as estatais regidas pela Lei 13.303/2016?', opts: ['Sim, integralmente', 'Não, a Lei 13.303/2016 está fora do escopo', 'Só nos capítulos de gestão do contrato'], a: 1, why: 'Item 1.1: o escopo não abrange a Lei 13.303/2016 nem regulamentos próprios do terceiro setor.' },
    { q: 'Nos quadros de riscos do manual, cada risco é escrito como…', opts: ['causa → evento → consequência', 'probabilidade × impacto', 'apenas a consequência'], a: 0, why: 'Item 1.2: “descrição da causa do risco”, levando ao “evento de risco”, com a consequente “consequência do risco”.' }
  ]
}];
