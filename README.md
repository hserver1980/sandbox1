# Censo em Sankey — Shorts

Vídeos curtos (YouTube Shorts, 1080×1920) com animações Sankey mostrando como a
população do Brasil mudou de censo em censo. Feito com [Remotion](https://www.remotion.dev).

| Composição | O que mostra | Dados |
|---|---|---|
| `RegioesShort` | Brasil → 5 Grandes Regiões → 27 UFs, 1872–2010 | SIDRA tabela 1286 |
| `UrbanoRuralShort` | Brasil → Urbana / Rural, 1950–2010 | SIDRA tabela 1288 |

## Começando

```bash
npm install
npm run studio        # abre o Remotion Studio em http://localhost:3000
```

## Editando cores, fontes, textos e tempo

Tudo o que não é dado é uma *prop* editável. No Studio, escolha a composição e use
o painel de props à direita. Clique em salvar e os valores são gravados em
`src/Root.tsx`, nos `defaultProps` de cada `<Composition>`. Você também pode
editar esse arquivo diretamente.

- **cores**: uma cor por região (os estados usam tons da cor da região) ou por Urbana/Rural.
- **estilo**: fundo (degradê), cores de texto, cor de destaque (ano, chamadas,
  botão final), `fonteTitulo` e `fonteTexto`, opacidade dos fluxos, e `escala`:
  - `relativa`: o gráfico sempre ocupa a altura toda e mostra a participação de cada parte.
  - `absoluta`: o gráfico cresce com a população.
- **tempo**:
  - `introSegundos` e `outroSegundos`: duração da abertura e do encerramento.
  - `segundosPorCenso`: tempo de cada censo na tela.
  - `pausaNoCenso`: quanto do tempo de cada censo o gráfico fica parado.
  - `suavizacao`: tipo de transição.
  - A duração total do vídeo se ajusta sozinha.
- **textos**: título, subtítulo, rótulo do total, chamada final e fonte.
- **destaques**: chamadas que aparecem em anos específicos (`ano` precisa ser um ano de censo).
- **layout**:
  - `topoGrafico` e `baseGrafico`: área do gráfico. Deixe ~350px livres na base
    para a interface do Shorts.
  - `tamanhoRotulos`: tamanho dos rótulos.

Para adicionar uma fonte do Google Fonts, importe-a em `src/lib/fonts.ts` e inclua
em `FONT_MODULES`. Ela aparece automaticamente na lista do Studio.

As cores padrão vêm de uma paleta categórica testada para daltonismo sobre fundo
escuro. Se trocar, mantenha regiões vizinhas com matizes bem diferentes.

## Atualizando os dados

```bash
npm run fetch-data
```

Busca os dados na API SIDRA do IBGE e regrava `src/data/*.json`. O script confere
que as partes somam o total de cada ano e mostra qualquer diferença. Os JSON ficam
versionados, então a renderização não depende da internet.

> A página da Sinopse do Censo 2010 (`censo2010.ibge.gov.br/sinopse`) bloqueia
> acesso automatizado, por isso usamos a API SIDRA, que publica as mesmas séries.

## Renderizando (quando estiver pronto)

```bash
npm run render:regioes   # out/regioes-ufs.mp4
npm run render:urbano    # out/urbano-rural.mp4
```

Ou renderize pelo próprio Studio. A pasta `out/` é ignorada pelo git.

## Estrutura

```
scripts/fetch-ibge.mjs          baixa e normaliza os dados do IBGE
src/data/*.json                 dados prontos (versionados)
src/Root.tsx                    composições + props padrão (editáveis)
src/schema.ts                   esquema zod das props (painel do Studio)
src/components/SankeyShort.tsx  estrutura das cenas: abertura → gráfico → encerramento
src/components/AnimatedSankey.tsx  desenho do Sankey (SVG)
src/components/Overlays.tsx     título, ano, total, chamadas, fonte, encerramento
src/lib/layout.ts               layout do Sankey e espaçamento dos rótulos
src/lib/timeline.ts             interpolação entre censos
src/compositions/               uma composição por vídeo
```

## Próximos passos

- Narração e trilha sonora (`@remotion/media` `<Audio>`).
- Versão 16:9 para vídeos longos: nova `<Composition>` com outro `width`/`height` e layout.

---

## English summary

A Remotion project for animated Sankey YouTube Shorts on Brazil's census
population, using IBGE SIDRA tables 1286 and 1288.

- `npm run studio`: preview the videos and edit colors, fonts, texts and timing in
  the props panel. Saving writes the changes back to `src/Root.tsx`.
- `npm run fetch-data`: refresh the data.
- `npm run render:*`: render the MP4s.
