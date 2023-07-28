import { Cartesian3 } from "cesium";

export type CrsFunction = (coors: number[]) => Cartesian3;

export function defaultCrsFunction(coordinates: number[]) {
  return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]);
}

export const crsNames: Record<string, CrsFunction> = {
  "urn:ogc:def:crs:OGC:1.3:CRS84": defaultCrsFunction,
  "EPSG:4326": defaultCrsFunction,
  "urn:ogc:def:crs:EPSG::4326": defaultCrsFunction,
};

export const crsLinkHrefs: Record<string, (properties: any) => CrsFunction> =
  {};

export const crsLinkTypes: Record<string, (properties: any) => CrsFunction> =
  {};

export function coordinatesArrayToCartesianArray(
  coordinates: number[][],
  crsFunction: CrsFunction
) {
  const positions: Cartesian3[] = new Array(coordinates.length);
  coordinates.map((coor, i) => {
    positions[i] = crsFunction(coor);
  });
  return positions;
}
