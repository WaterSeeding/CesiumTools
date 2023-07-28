import * as Cesium from "cesium";

export type CrsFunction = (coors: number[]) => Cesium.Cartesian3;

export const setCoordinatesArrayToCartesianArray = (
  coordinates: number[][],
  crsFunction: CrsFunction
): Cesium.Cartesian3[] => {
  const positions: Cesium.Cartesian3[] = new Array(coordinates.length);
  coordinates.map((coor, i) => {
    positions[i] = crsFunction(coor);
  });
  return positions;
};
