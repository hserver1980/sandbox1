import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import type { Dataset } from "../lib/dataset";
import { getFontFamily } from "../lib/fonts";
import { chartSeconds, chartStateAt, maxTotal } from "../lib/timeline";
import type { ShortBaseProps } from "../schema";
import { AnimatedSankey } from "./AnimatedSankey";
import { Callout, ChartHeader, EndCard, SourceFooter, TitleCard } from "./Overlays";

// Shared scene structure for every Sankey Short: title card -> animated chart
// across the censuses -> end card. Each composition only supplies its dataset
// and the color for every node.
export const SankeyShort: React.FC<ShortBaseProps & { dataset: Dataset; colors: Record<string, string> }> = ({
  dataset,
  colors,
  estilo,
  tempo,
  textos,
  layout,
  destaques,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleFont = getFontFamily(estilo.fonteTitulo);
  const textFont = getFontFamily(estilo.fonteTexto);
  const ink = { primary: estilo.textoPrincipal, secondary: estilo.textoSecundario, accent: estilo.destaque };

  const introFrames = Math.round(tempo.introSegundos * fps);
  const chartFrames = Math.round(chartSeconds(dataset, tempo) * fps);
  const outroFrames = Math.round(tempo.outroSegundos * fps);

  // The chart keeps running under the title fade and the end card.
  const state = chartStateAt(dataset, tempo, (frame - introFrames) / fps);
  const callout = destaques.find((d) => d.ano === dataset.years[state.index]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${estilo.fundo} 0%, ${estilo.fundoBase} 100%)` }}>
      <Sequence name="Gráfico" from={Math.max(0, introFrames - Math.round(0.5 * fps))} layout="absolute-fill">
        <AnimatedSankey
          dataset={dataset}
          values={state.values}
          colors={colors}
          scaleTotal={estilo.escala === "absoluta" ? maxTotal(dataset) : state.values.brasil}
          top={layout.topoGrafico}
          bottom={layout.baseGrafico}
          labelSize={layout.tamanhoRotulos}
          linkOpacity={estilo.opacidadeFluxos}
          textPrimary={ink.primary}
          textSecondary={ink.secondary}
          background={estilo.fundoBase}
          fontFamily={textFont}
        />
        <ChartHeader
          title={textos.titulo}
          year={state.year}
          total={state.values.brasil}
          totalLabel={textos.rotuloTotal}
          ink={ink}
          titleFont={titleFont}
          textFont={textFont}
        />
        {callout && frame >= introFrames && frame < introFrames + chartFrames ? (
          <Callout
            text={callout.texto}
            seconds={state.secondsInSegment}
            slot={tempo.segundosPorCenso}
            bottom={layout.topoGrafico - 24}
            ink={ink}
            background={estilo.fundoBase}
            textFont={textFont}
          />
        ) : null}
        <SourceFooter text={textos.fonte} top={layout.baseGrafico + 30} ink={ink} textFont={textFont} />
      </Sequence>

      {introFrames > 0 ? (
        <Sequence name="Abertura" durationInFrames={introFrames} layout="absolute-fill">
          <TitleCard
            title={textos.titulo}
            subtitle={textos.subtitulo}
            ink={ink}
            background={estilo.fundo}
            titleFont={titleFont}
            textFont={textFont}
          />
        </Sequence>
      ) : null}

      {outroFrames > 0 ? (
        <Sequence name="Encerramento" from={introFrames + chartFrames} durationInFrames={outroFrames} layout="absolute-fill">
          <EndCard
            title={textos.chamadaFinal}
            subtitle={textos.subChamadaFinal}
            ink={ink}
            background={estilo.fundo}
            titleFont={titleFont}
            textFont={textFont}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
