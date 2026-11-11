// Partes comuns: barra superior, rodapé e progresso geral
import { el, compassSVG, store } from './core.js';
import { CHAPTERS, loadLessons, SITE_URL, PDF_URL } from './meta.js';

export async function allLessons() {
  const arr = await Promise.all(CHAPTERS.map(c => loadLessons(c.n)));
  return CHAPTERS.map((c, i) => ({ ...c, lessons: arr[i] }));
}
export function chapterProgress(lessons) {
  const done = lessons.filter(l => store.done(l.id)).length;
  return { done, total: lessons.length, p: lessons.length ? done / lessons.length : 0 };
}

export function topbar(active) {
  const bar = el('header', { class: 'topbar' });
  document.body.prepend(bar);
  el('a', { class: 'brand', href: './' }, bar, `${compassSVG(34)}<span>LICITAÇÕES<br>E CONTRATOS<small>edição interativa</small></span>`);
  const nav = el('nav', { 'aria-label': 'Capítulos' }, bar);
  CHAPTERS.forEach(c => el('a', { href: `capitulo.html?c=${c.n}`, class: (active === c.n ? 'on ' : '') + 'hide-sm', title: c.title }, nav, `${c.n}. ${c.title.split(' ')[0]}`));
  const chip = el('span', { class: 'chip-progress', title: 'Lições concluídas neste navegador' }, bar, '…');
  const refresh = async () => {
    const all = await allLessons();
    const ls = all.flatMap(c => c.lessons);
    chip.textContent = `${ls.filter(l => store.done(l.id)).length}/${ls.length} lições`;
  };
  refresh();
  addEventListener('lesson-done', refresh);
  return bar;
}

export function footer() {
  const f = el('footer', { class: 'footer' }, document.body);
  el('div', { class: 'wrap cols' }, f, `
    <div>
      <b style="color:#fff;font-family:Montserrat">Licitações e Contratos · edição interativa</b>
      <p>Projeto educacional independente e não oficial, sem fins comerciais. Não é uma publicação do Tribunal de Contas da União.</p>
      <p>O texto integral reproduzido na aba “Texto integral” é do manual <i>Licitações e Contratos: Orientações e Jurisprudência do TCU</i>, 5ª edição, versão 3.0 (atualizada em 29/08/2025), Tribunal de Contas da União, que “permite-se a reprodução desta publicação, em parte ou no todo, sem alteração do conteúdo, desde que citada a fonte e sem fins comerciais”.</p>
      <p>As lições, simuladores e resumos são uma camada didática própria e não substituem a leitura do manual, da Lei 14.133/2021 e dos regulamentos.</p>
    </div>
    <div>
      <p><b style="color:#fff">Fontes oficiais</b></p>
      <p><a href="${SITE_URL}" target="_blank" rel="noopener">Manual no site do TCU</a><br>
      <a href="${PDF_URL}" target="_blank" rel="noopener">Manual em PDF (TCU)</a><br>
      <a href="https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm" target="_blank" rel="noopener">Lei 14.133/2021 (Planalto)</a></p>
      <p class="hint">Seu progresso fica salvo só neste navegador.</p>
    </div>`);
}
