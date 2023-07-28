import * as Cesium from "cesium";
import type { GeoJSON } from "geojson";
import type GeoJsonPrimitiveLayer from "../PrimitiveLayer";
import type { PrimitiveLayerOptions } from "../typings";
import {
  CrsFunction,
  setCoordinatesArrayToCartesianArray,
} from "./setCoordinatesArrayToCartesianArray";

type GetKey<T extends { type: string }> = {
  [K in T["type"]]: (
    geoJsonLayer: GeoJsonPrimitiveLayer,
    geoJson: any,
    geometryCollection: any,
    crsFunction: CrsFunction,
    options: PrimitiveLayerOptions
  ) => void;
};

const processFeature = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  feature: GeoJSON.Feature,
  notUsed: GeoJSON.Feature | undefined,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  if (feature.geometry === null) {
    return;
  }

  if (!Cesium.defined(feature.geometry)) {
    throw new Cesium.RuntimeError("feature.geometry is required.");
  }

  const geometryType = feature.geometry.type;
  console.log('geometryType', geometryType);
  const geometryHandler = geometryTypes[geometryType];
  if (!Cesium.defined(geometryHandler)) {
    throw new Cesium.RuntimeError(`Unknown geometry type: ${geometryType}`);
  }
  geometryHandler(
    geoJsonLayer,
    feature,
    feature.geometry,
    crsFunction,
    options
  );
};

const processFeatureCollection = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  featureCollection: GeoJSON.FeatureCollection,
  notUsed: GeoJSON.FeatureCollection,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  const features = featureCollection.features;
  features.map((feature) => {
    processFeature(geoJsonLayer, feature, undefined, crsFunction, options);
  });
};

const processGeometryCollection = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON,
  geometryCollection: GeoJSON.GeometryCollection,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  const geometries = geometryCollection.geometries;
  geometries.map((geometry) => {
    const geometryType = geometry.type;
    const geometryHandler = geometryTypes[geometryType];
    if (!Cesium.defined(geometryHandler)) {
      throw new Cesium.RuntimeError(`Unknown geometry type: ${geometryType}`);
    }
    geometryHandler(geoJsonLayer, geoJson, geometry, crsFunction, options);
  });
};

const createPoint = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: number[],
  options: PrimitiveLayerOptions
) => {
  const symbol = options.markerSymbol;
  const color = options.markerColor;
  const size = options.markerSize;

  const properties = geoJson.properties ?? {};

  /** add billboard */
  if (!symbol) {
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
  } else {
    let canvasOrPromise;
    if (symbol !== "" && Cesium.defined(symbol)) {
      if (symbol.length === 1) {
        canvasOrPromise = geoJsonLayer.pinBuilder.fromText(
          symbol.toUpperCase(),
          color,
          size * 3
        );
      } else {
        canvasOrPromise = geoJsonLayer.pinBuilder.fromMakiIconId(
          symbol,
          color,
          size * 3
        );
      }
    } else {
      canvasOrPromise = geoJsonLayer.pinBuilder.fromColor(color, size * 3);
    }

    const billboard = geoJsonLayer.addBillboard({
      type: "Billboard",
      position: crsFunction(coordinates),
      style: {
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference:
          coordinates.length === 2 && options.clampToGround
            ? Cesium.HeightReference.CLAMP_TO_GROUND
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
};

const processPoint = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.Point,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  createPoint(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options
  );
};

const processMultiPoint = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiPoint,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  geometry.coordinates.map((coor) =>
    createPoint(geoJsonLayer, geoJson, crsFunction, coor, options)
  );
};

const createLineString = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: number[][],
  options: PrimitiveLayerOptions
) => {
  const properties = geoJson.properties ?? {};
  const positions = setCoordinatesArrayToCartesianArray(
    coordinates,
    crsFunction
  );
  geoJsonLayer.addPolyline({
    type: "Polyline",
    positions,
    properties,
    style: {
      material: options.fill,
      width: options.strokeWidth,
    },
  });
};

const processLineString = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.LineString,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  createLineString(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options
  );
};

const processMultiLineString = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiLineString,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  const lineStrings = geometry.coordinates;
  lineStrings.map((lineString) => {
    createLineString(geoJsonLayer, geoJson, crsFunction, lineString, options);
  });
};

const createPolygon = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: GeoJSON.Position[][],
  options: PrimitiveLayerOptions
) => {
  if (coordinates.length === 0 || coordinates[0].length === 0) {
    return;
  }
  const properties = geoJson.properties ?? {};

  const positions = setCoordinatesArrayToCartesianArray(
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
};

const processPolygon = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.Polygon,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  createPolygon(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options
  );
};

const processMultiPolygon = (
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiPolygon,
  crsFunction: CrsFunction,
  options: PrimitiveLayerOptions
) => {
  const polygons = geometry.coordinates;
  polygons.map((polygon) => {
    createPolygon(geoJsonLayer, geoJson, crsFunction, polygon, options);
  });
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

export const setGeoJsonToTypeHandler: GetKey<GeoJSON.GeoJSON> = {
  Feature: processFeature,
  FeatureCollection: processFeatureCollection,
  ...geometryTypes,
};
