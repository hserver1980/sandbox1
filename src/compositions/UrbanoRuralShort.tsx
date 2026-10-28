import React from "react";
import { SankeyShort } from "../components/SankeyShort";
import { DATASETS } from "../lib/dataset";
import type { UrbanoRuralProps } from "../schema";

const dataset = DATASETS["urbano-rural"];

export const UrbanoRuralShort: React.FC<UrbanoRuralProps> = ({ cores, ...rest }) => (
  <SankeyShort dataset={dataset} colors={{ ...cores }} {...rest} />
);
