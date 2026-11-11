# Licitações e Contratos · edição interativa

Edição didática e interativa do manual **Licitações e Contratos: Orientações e Jurisprudência do TCU** (5ª edição, versão 3.0, atualizada em 29/08/2025), inspirada no formato do projeto *Every Joule*: cada lição se desenha na tela e segue o ciclo **Cena → Preveja → Teste → Entenda → Fixe**.

> Projeto educacional independente e **não oficial**, sem fins comerciais. Não é uma publicação do Tribunal de Contas da União.

## O que tem

- **6 capítulos**, com o **texto integral** das 209 seções do manual (notas de rodapé clicáveis, quadros de referências normativas, jurisprudência, riscos e figuras), link para a página correspondente do PDF e para o site oficial.
- **17 lições interativas** com simuladores:
  - Cap. 1 · mapa do metaprocesso (montar a linha do tempo da contratação)
  - Cap. 2 · quantidade ideal de controles, matriz de riscos, três linhas de defesa
  - Cap. 3 · fases e inversão de fases, qual modalidade usar, técnica e preço, modos de disputa
  - Cap. 4 · 13 elementos do ETP, pesquisa de preços (IN 65/2021), regimes de execução de obras
  - Cap. 5 · sessão de lances ao vivo, dispensa × inexigibilidade (com calculadora), desempate e ME/EPP
  - Cap. 6 · recebimento e fiscalização, limites de aditivos, reajuste × repactuação × revisão
- **Busca** no manual inteiro e progresso salvo no navegador.

## Rodar localmente

Os capítulos são carregados via `fetch`, então é preciso um servidor local:

```bash
python3 -m http.server 8000
```

Abra http://localhost:8000.

## Publicar no GitHub Pages

Settings → Pages → *Deploy from a branch* → `main` / raiz. O site é estático, sem etapa de build.

## Estrutura

```
index.html         capa animada, ciclo, mapa dos capítulos e busca
capitulo.html      ?c=1..6 · trilha interativa + texto integral
css/style.css      identidade visual inspirada na capa da 5ª edição
js/core.js         traço que se desenha, pulsos de luz, ondas, progresso
js/lesson.js       motor do ciclo Cena → Preveja → Teste → Entenda → Fixe
js/lessons/c*.js   lições de cada capítulo
data/cap*.json     texto integral por capítulo · data/sumario.json
assets/fig/        figuras do manual
```

Para criar uma lição nova, adicione um objeto ao array do capítulo em `js/lessons/cN.js` com `id`, `title`, `secs`, `narr`, `scene`, `predict`, `lab`, `reveal` e `quiz`.

## Fonte e licença do conteúdo

Texto do manual: © Tribunal de Contas da União. A publicação informa: *“Permite-se a reprodução desta publicação, em parte ou no todo, sem alteração do conteúdo, desde que citada a fonte e sem fins comerciais.”* O texto foi reproduzido sem alteração a partir do site oficial <https://licitacoesecontratos.tcu.gov.br/>.

Lições, simuladores e código: camada didática própria. Não substituem a leitura do manual, da Lei 14.133/2021 e dos regulamentos.
