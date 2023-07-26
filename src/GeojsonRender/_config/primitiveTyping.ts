
import * as Cesium from "cesium";

export type PrimitiveLayerOptions = {
  sourceUri?: string;
  markerSize: number;
  markerSymbol?: string;
  markerColor: Cesium.Color;
  stroke: Cesium.Color;
  strokeWidth: number;
  fill: Cesium.Color;
  clampToGround: boolean;
  credit?: Cesium.Credit | string;
};
