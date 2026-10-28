import { Composition, Folder } from "remotion";
import { durationFor } from "./compositions/metadata";
import { RegioesShort } from "./compositions/RegioesShort";
import { UrbanoRuralShort } from "./compositions/UrbanoRuralShort";
import { regioesSchema, urbanoRuralSchema, type RegioesProps, type UrbanoRuralProps } from "./schema";

// Edit colors, fonts, texts and timing in the Studio props panel (right side)
// and click save: the values below are rewritten in place.
//
// Default series colors are a CVD-checked categorical palette for the dark
// background (validated adjacent-pair separation, >= 3:1 contrast). If you
// swap them, keep neighbouring regions clearly different in hue.

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Shorts">
      <Composition
        id="RegioesShort"
        component={RegioesShort}
        schema={regioesSchema}
        calculateMetadata={durationFor<RegioesProps>("regioes-ufs")}
        durationInFrames={1440}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          cores: {
            brasil: "#8a8f98",
            norte: "#3987e5",
            nordeste: "#d95926",
            sudeste: "#199e70",
            sul: "#c98500",
            centroOeste: "#d55181",
          },
          estilo: {
            fundo: "#111318",
            fundoBase: "#0a0b0e",
            textoPrincipal: "#f0efec",
            textoSecundario: "#a9a8a0",
            destaque: "#f5c518",
            fonteTitulo: "Montserrat",
            fonteTexto: "Inter",
            opacidadeFluxos: 0.55,
            escala: "relativa",
          },
          tempo: {
            introSegundos: 3,
            segundosPorCenso: 3.5,
            pausaNoCenso: 0.45,
            outroSegundos: 3,
            suavizacao: "suave",
          },
          textos: {
            titulo: "Onde vivem os brasileiros?",
            subtitulo: "138 anos de censos em menos de um minuto",
            rotuloTotal: "População:",
            chamadaFinal: "Qual estado mais te surpreendeu?",
            subChamadaFinal: "Inscreva-se para mais dados",
            fonte: "Fonte: IBGE, Censos Demográficos 1872-2010",
          },
          layout: {
            topoGrafico: 560,
            baseGrafico: 1560,
            tamanhoRotulos: 28,
          },
          destaques: [
            { ano: "1872", texto: "1º censo: o Nordeste tinha quase metade da população" },
            { ano: "1890", texto: "O Sudeste passa o Nordeste pela primeira vez" },
            { ano: "1940", texto: "São Paulo ultrapassa Minas e vira o estado mais populoso" },
            { ano: "1960", texto: "Brasília é inaugurada e o DF entra no mapa" },
            { ano: "2010", texto: "Mais de 1 em cada 5 brasileiros vive em SP" },
          ],
        }}
      />
      <Composition
        id="UrbanoRuralShort"
        component={UrbanoRuralShort}
        schema={urbanoRuralSchema}
        calculateMetadata={durationFor<UrbanoRuralProps>("urbano-rural")}
        durationInFrames={1230}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          cores: {
            brasil: "#8a8f98",
            urbana: "#3987e5",
            rural: "#d95926",
          },
          estilo: {
            fundo: "#111318",
            fundoBase: "#0a0b0e",
            textoPrincipal: "#f0efec",
            textoSecundario: "#a9a8a0",
            destaque: "#f5c518",
            fonteTitulo: "Montserrat",
            fonteTexto: "Inter",
            opacidadeFluxos: 0.55,
            escala: "absoluta",
          },
          tempo: {
            introSegundos: 3,
            segundosPorCenso: 5,
            pausaNoCenso: 0.4,
            outroSegundos: 3,
            suavizacao: "suave",
          },
          textos: {
            titulo: "O Brasil saiu do campo",
            subtitulo: "Como viramos um país urbano em 60 anos",
            rotuloTotal: "População:",
            chamadaFinal: "Você mora na cidade ou no campo?",
            subChamadaFinal: "Inscreva-se para mais dados",
            fonte: "Fonte: IBGE, Censos Demográficos 1950-2010",
          },
          layout: {
            topoGrafico: 560,
            baseGrafico: 1560,
            tamanhoRotulos: 34,
          },
          destaques: [
            { ano: "1950", texto: "Quase 2 em cada 3 brasileiros viviam no campo" },
            { ano: "1970", texto: "Pela primeira vez, a maioria vive nas cidades" },
            { ano: "1980", texto: "A população rural começa a encolher" },
            { ano: "2010", texto: "84% dos brasileiros vivem em áreas urbanas" },
          ],
        }}
      />
    </Folder>
  );
};
