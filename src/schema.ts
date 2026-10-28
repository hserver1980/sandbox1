import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { FONT_NAMES } from "./lib/fonts";

// Everything a viewer sees that isn't data lives in these props, so it can be
// edited in the Remotion Studio props panel (and saved back to src/Root.tsx).

export const estiloSchema = z.object({
  fundo: zColor().describe("Cor de fundo (topo)"),
  fundoBase: zColor().describe("Cor de fundo (base do degradê)"),
  textoPrincipal: zColor(),
  textoSecundario: zColor(),
  destaque: zColor().describe("Cor de destaque: ano, chamadas, botão final"),
  fonteTitulo: z.enum(FONT_NAMES),
  fonteTexto: z.enum(FONT_NAMES),
  opacidadeFluxos: z.number().min(0.1).max(1).step(0.05),
  escala: z
    .enum(["relativa", "absoluta"])
    .describe("relativa: o gráfico sempre ocupa a altura toda (mostra participação). absoluta: cresce com a população"),
});

export const tempoSchema = z.object({
  introSegundos: z.number().min(0).max(10).step(0.5),
  segundosPorCenso: z.number().min(1).max(10).step(0.25),
  pausaNoCenso: z.number().min(0).max(0.9).step(0.05).describe("Fração de cada censo em que o gráfico fica parado"),
  outroSegundos: z.number().min(0).max(10).step(0.5),
  suavizacao: z.enum(["suave", "linear", "dramatica"]),
});

export const textosSchema = z.object({
  titulo: z.string(),
  subtitulo: z.string(),
  rotuloTotal: z.string(),
  chamadaFinal: z.string(),
  subChamadaFinal: z.string(),
  fonte: z.string(),
});

export const layoutSchema = z.object({
  topoGrafico: z.number().min(300).max(1000).describe("px a partir do topo (1920 de altura)"),
  baseGrafico: z.number().min(1000).max(1800).describe("Shorts cobre ~350px da base com a interface"),
  tamanhoRotulos: z.number().min(16).max(60),
});

export const destaqueSchema = z.object({
  ano: z.string().describe("Ano do censo em que a chamada aparece"),
  texto: z.string(),
});

const shortBase = {
  estilo: estiloSchema,
  tempo: tempoSchema,
  textos: textosSchema,
  layout: layoutSchema,
  destaques: z.array(destaqueSchema),
};

export const regioesSchema = z.object({
  ...shortBase,
  cores: z.object({
    brasil: zColor(),
    norte: zColor(),
    nordeste: zColor(),
    sudeste: zColor(),
    sul: zColor(),
    centroOeste: zColor(),
  }),
});

export const urbanoRuralSchema = z.object({
  ...shortBase,
  cores: z.object({
    brasil: zColor(),
    urbana: zColor(),
    rural: zColor(),
  }),
});

export type ShortBaseProps = z.infer<z.ZodObject<typeof shortBase>>;
export type RegioesProps = z.infer<typeof regioesSchema>;
export type UrbanoRuralProps = z.infer<typeof urbanoRuralSchema>;
