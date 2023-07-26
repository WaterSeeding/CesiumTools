import {
  Cartesian3,
  defined,
  HeightReference,
  RuntimeError,
  VerticalOrigin,
} from "cesium";

import type { GeoJSON } from "geojson";
import type GeoJsonPrimitiveLayer from "./PrimitiveLayer";
import type { PrimitiveLayerOptions } from "./typings";

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

type GetKey<T extends { type: string }> = {
  [K in T["type"]]: (
    geoJsonLayer: GeoJsonPrimitiveLayer,
    geoJson: any,
    geometryCollection: any,
    crsFunction: CrsFunction,
    options: PrimitiveLayerOptions
  ) => void;
};

export const geoJsonObjectTypes: GetKey<GeoJSON.GeoJSON> = {
  Feature: processFeature,
  FeatureCollection: processFeatureCollection,
  GeometryCollection: processGeometryCollection,
  LineString: processLineString,
  MultiLineString: processMultiLineString,
  MultiPoint: processMultiPoint,
  MultiPolygon: processMultiPolygon,
  Point: processPoint,
  Polygon: processPolygon,
};

export const geometryTypes: GetKey<GeoJSON.Geometry> = {
  GeometryCollection: processGeometryCollection,
  LineString: processLineString,
  MultiLineString: processMultiLineString,
  MultiPoint: processMultiPoint,
  MultiPolygon: processMultiPolygon,
  Point: processPoint,
  Polygon: processPolygon,
};

// GeoJSON processing functions
export function processFeature(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  feature: GeoJSON.Feature,
  notUsed: GeoJSON.Feature | undefined,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  if (feature.geometry === null) {
    return;
  }

  if (!defined(feature.geometry)) {
    throw new RuntimeError("feature.geometry is required.");
  }

  const geometryType = feature.geometry.type;
  const geometryHandler = geometryTypes[geometryType];
  if (!defined(geometryHandler)) {
    throw new RuntimeError(`Unknown geometry type: ${geometryType}`);
  }
  geometryHandler(
    geoJsonLayer,
    feature,
    feature.geometry,
    crsFunction,
    options
  );
}

export function processFeatureCollection(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  featureCollection: GeoJSON.FeatureCollection,
  notUsed: GeoJSON.FeatureCollection,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  const features = featureCollection.features;
  features.map((feature) => {
    processFeature(geoJsonLayer, feature, undefined, crsFunction, options);
  });
}

export function processGeometryCollection(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON,
  geometryCollection: GeoJSON.GeometryCollection,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  const geometries = geometryCollection.geometries;
  geometries.map((geometry) => {
    const geometryType = geometry.type;
    const geometryHandler = geometryTypes[geometryType];
    if (!defined(geometryHandler)) {
      throw new RuntimeError(`Unknown geometry type: ${geometryType}`);
    }
    geometryHandler(geoJsonLayer, geoJson, geometry, crsFunction, options);
  });
}

export function createPoint(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: number[],
  options: PrimitiveLayerOptions
) {
  const symbol = options.markerSymbol;
  const color = options.markerColor;
  const size = options.markerSize;

  const properties = geoJson.properties ?? {};

  geoJsonLayer.addPoint({
    type: "Point",
    position: crsFunction(coordinates),
    style: {
      color: color,
      pixelSize: size,
      outlineColor: options.stroke,
      outlineWidth: options.strokeWidth,
    },
    properties,
  });

  /** add billboard */
  if (!symbol) return;
  let canvasOrPromise;
  if (symbol !== "" && defined(symbol)) {
    if (symbol.length === 1) {
      canvasOrPromise = geoJsonLayer.pinBuilder.fromText(
        symbol.toUpperCase(),
        color,
        size
      );
    } else {
      canvasOrPromise = geoJsonLayer.pinBuilder.fromMakiIconId(
        symbol,
        color,
        size
      );
    }
  } else {
    canvasOrPromise = geoJsonLayer.pinBuilder.fromColor(color, size);
  }

  const billboard = geoJsonLayer.addBillboard({
    type: "Billboard",
    position: crsFunction(coordinates),
    style: {
      verticalOrigin: VerticalOrigin.BOTTOM,
      heightReference:
        coordinates.length === 2 && options.clampToGround
          ? HeightReference.CLAMP_TO_GROUND
          : undefined,
    },
    properties,
  });

  const promise = Promise.resolve(canvasOrPromise)
    .then(function (image) {
      // @ts-ignore
      billboard.image = image;
    })
    .catch(function () {
      // @ts-ignore
      billboard.image = geoJsonLayer.pinBuilder.fromColor(color, size);
    });

  geoJsonLayer._promises.push(promise);
}

export function processPoint(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.Point,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  createPoint(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options
  );
}

export function processMultiPoint(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiPoint,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  geometry.coordinates.map((coor) =>
    createPoint(geoJsonLayer, geoJson, crsFunction, coor, options)
  );
}

export function createLineString(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: number[][],
  options: PrimitiveLayerOptions
) {
  const properties = geoJson.properties ?? {};
  const positions = coordinatesArrayToCartesianArray(coordinates, crsFunction);
  geoJsonLayer.addPolyline({
    type: "Polyline",
    positions,
    properties,
    style: {
      material: options.fill,
      width: options.strokeWidth,
    },
  });
}

export function processLineString(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.LineString,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  createLineString(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options
  );
}

export function processMultiLineString(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiLineString,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  const lineStrings = geometry.coordinates;
  lineStrings.map((lineString) => {
    createLineString(geoJsonLayer, geoJson, crsFunction, lineString, options);
  });
}

export function createPolygon(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: GeoJSON.Position[][],
  options: PrimitiveLayerOptions
) {
  if (coordinates.length === 0 || coordinates[0].length === 0) {
    return;
  }
  const properties = geoJson.properties ?? {};

  const positions = coordinatesArrayToCartesianArray(
    coordinates[0],
    crsFunction
  );
  geoJsonLayer.addPolygon({
    type: "Polygon",
    positions,
    style: {
      material: options.fill,
      outlineColor: options.stroke,
      outlineWidth: options.strokeWidth,
    },
    properties,
  });
}

export function processPolygon(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.Polygon,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  createPolygon(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options
  );
}

export function processMultiPolygon(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiPolygon,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) {
  const polygons = geometry.coordinates;
  polygons.map((polygon) => {
    createPolygon(geoJsonLayer, geoJson, crsFunction, polygon, options);
  });
}
