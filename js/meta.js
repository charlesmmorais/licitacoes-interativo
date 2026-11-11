// Metadados dos capítulos (títulos do manual) e ícones em traço
export const PDF_URL = 'https://licitacoesecontratos.tcu.gov.br/wp-content/uploads/sites/11/2026/02/Manual-versao-SECOM-publicada-no-site-VERSAO-FINAL-ATUALIZADA-1_compressed-1.pdf';
export const SITE_URL = 'https://licitacoesecontratos.tcu.gov.br/';
export const PDF_OFFSET = 11; // página do livro + 11 = página do PDF

const I = {
  compass: '<circle cx="28" cy="28" r="22"/><path d="M28 28 L40 14 L33 32 Z M28 28 L16 42 L23 24 Z"/>',
  pillars: '<path d="M8 46 H48 M10 20 L28 8 L46 20 Z M14 22 V42 M24 22 V42 M32 22 V42 M42 22 V42"/>',
  flow: '<circle cx="10" cy="28" r="5"/><circle cx="28" cy="28" r="5"/><circle cx="46" cy="28" r="5"/><path d="M15 28 H23 M33 28 H41 M28 10 V23 M22 14 L28 8 L34 14"/>',
  blueprint: '<path d="M10 8 H38 L46 16 V48 H10 Z M38 8 V16 H46 M16 24 H40 M16 32 H40 M16 40 H30"/>',
  gavel: '<path d="M14 20 L26 8 L34 16 L22 28 Z M24 18 L42 36 M8 48 H32"/>',
  check: '<rect x="10" y="8" width="36" height="42" rx="4"/><path d="M20 8 V4 H36 V8 M18 30 L25 37 L38 22"/>'
};
export const icon = (k, size = 56) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" stroke="#b9ecff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

export const CHAPTERS = [
  { n: 1, title: 'Introdução', tag: 'O mapa do manual: objetivo, escopo e como o conteúdo está organizado.', ico: 'compass' },
  { n: 2, title: 'Governança das contratações públicas', tag: 'Integridade, riscos, gestão estratégica, PCA, transparência e as linhas de defesa.', ico: 'pillars' },
  { n: 3, title: 'Metaprocesso de contratação pública', tag: 'Princípios, agentes, critérios de julgamento, modos de disputa e modalidades.', ico: 'flow' },
  { n: 4, title: 'Planejamento da contratação', tag: 'ETP, análise de riscos, termo de referência, pesquisa de preços, obras e edital.', ico: 'blueprint' },
  { n: 5, title: 'Seleção do fornecedor', tag: 'Propostas, lances, julgamento, habilitação, recursos, contratação direta e contrato.', ico: 'gavel' },
  { n: 6, title: 'Gestão do contrato', tag: 'Execução, fiscalização, recebimento, pagamento, alterações, prorrogação e extinção.', ico: 'check' }
];

export async function loadLessons(n) {
  return (await import(`./lessons/c${n}.js`)).default;
}
