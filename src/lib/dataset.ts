import regioesUfs from "../data/regioes-ufs.json";
import urbanoRural from "../data/urbano-rural.json";

export type DatasetNode = {
  id: string;
  label: string;
  // Optional short label (UF abbreviation) used where space is tight.
  short?: string;
  // 0 = root (Brasil), 1 = first split, 2 = second split.
  level: number;
  parent: string | null;
};

export type Dataset = {
  title: string;
  source: string;
  years: string[];
  nodes: DatasetNode[];
  // values[year][nodeId] = population. 0 means the unit didn't exist yet.
  values: Record<string, Record<string, number>>;
};

export const DATASETS = {
  "regioes-ufs": regioesUfs as Dataset,
  "urbano-rural": urbanoRural as Dataset,
};

export type DatasetId = keyof typeof DATASETS;
