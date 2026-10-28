import type { CalculateMetadataFunction } from "remotion";
import { DATASETS, type DatasetId } from "../lib/dataset";
import { totalSeconds } from "../lib/timeline";
import type { ShortBaseProps } from "../schema";

// Duration follows the timing props, so changing "segundosPorCenso" in the
// Studio resizes the timeline automatically.
export const durationFor =
  <P extends ShortBaseProps>(id: DatasetId): CalculateMetadataFunction<P> =>
  ({ props }) => ({
    durationInFrames: Math.ceil(totalSeconds(DATASETS[id], props.tempo) * 30),
    defaultOutName: id,
  });
