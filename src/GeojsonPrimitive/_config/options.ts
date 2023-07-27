import * as Cesium from "cesium";

import type { PrimitiveLayerOptions } from "../typings";

const DefaultOptions: PrimitiveLayerOptions = {
  markerSize: 10,
  markerColor: Cesium.Color.fromCssColorString("#FC4C02"),
  stroke: Cesium.Color.WHITE,
  strokeWidth: 2,
  fill: Cesium.Color.fromCssColorString("#FC4C02"),
  clampToGround: false,
};

export default DefaultOptions;
