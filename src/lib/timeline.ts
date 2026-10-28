import { Easing } from "remotion";
import type { Dataset } from "./dataset";
import type { ShortBaseProps } from "../schema";

type Tempo = ShortBaseProps["tempo"];

const EASINGS: Record<Tempo["suavizacao"], (t: number) => number> = {
  suave: Easing.bezier(0.45, 0, 0.2, 1),
  linear: Easing.linear,
  dramatica: Easing.bezier(0.8, 0, 0.1, 1),
};

export const chartSeconds = (dataset: Dataset, tempo: Tempo) => dataset.years.length * tempo.segundosPorCenso;

export const totalSeconds = (dataset: Dataset, tempo: Tempo) =>
  tempo.introSegundos + chartSeconds(dataset, tempo) + tempo.outroSegundos;

export type ChartState = {
  // Census currently shown (or being left), and how far we are towards the next one.
  index: number;
  progress: number;
  // Seconds since the current census segment started; drives callout fades.
  secondsInSegment: number;
  year: number;
  values: Record<string, number>;
};

// Each census gets an equal slot of `segundosPorCenso`. The first `pausaNoCenso`
// of the slot holds the census values, the rest morphs into the next census.
// The last census holds for its whole slot.
export const chartStateAt = (dataset: Dataset, tempo: Tempo, seconds: number): ChartState => {
  const { years, values } = dataset;
  const last = years.length - 1;
  const position = Math.max(0, seconds) / tempo.segundosPorCenso;
  const index = Math.min(last, Math.floor(position));
  const frac = index === last ? 0 : position - index;
  const raw = frac <= tempo.pausaNoCenso ? 0 : (frac - tempo.pausaNoCenso) / (1 - tempo.pausaNoCenso);
  const progress = EASINGS[tempo.suavizacao](Math.min(1, raw));

  const from = values[years[index]];
  const to = values[years[Math.min(last, index + 1)]];
  const mixed: Record<string, number> = {};
  for (const id of Object.keys(from)) mixed[id] = from[id] + (to[id] - from[id]) * progress;

  const fromYear = Number(years[index]);
  const toYear = Number(years[Math.min(last, index + 1)]);

  return {
    index,
    progress,
    secondsInSegment: Math.max(0, seconds) - index * tempo.segundosPorCenso,
    year: Math.round(fromYear + (toYear - fromYear) * progress),
    values: mixed,
  };
};

export const maxTotal = (dataset: Dataset) => Math.max(...dataset.years.map((y) => dataset.values[y].brasil));
