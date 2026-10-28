import React from "react";
import { SankeyShort } from "../components/SankeyShort";
import { shade } from "../lib/color";
import { DATASETS } from "../lib/dataset";
import type { RegioesProps } from "../schema";

const dataset = DATASETS["regioes-ufs"];

const REGION_KEYS: Record<string, keyof RegioesProps["cores"]> = {
  norte: "norte",
  nordeste: "nordeste",
  sudeste: "sudeste",
  sul: "sul",
  "centro-oeste": "centroOeste",
};

// States take their region's color, alternating slightly lighter/darker so
// neighbouring states in the same region stay distinguishable.
const buildColors = (cores: RegioesProps["cores"]) => {
  const colors: Record<string, string> = { brasil: cores.brasil };
  for (const [id, key] of Object.entries(REGION_KEYS)) {
    colors[id] = cores[key];
    dataset.nodes
      .filter((n) => n.parent === id)
      .forEach((n, i) => {
        colors[n.id] = shade(cores[key], i % 2 === 0 ? 0.12 : -0.12);
      });
  }
  return colors;
};

export const RegioesShort: React.FC<RegioesProps> = ({ cores, ...rest }) => (
  <SankeyShort dataset={dataset} colors={buildColors(cores)} {...rest} />
);
