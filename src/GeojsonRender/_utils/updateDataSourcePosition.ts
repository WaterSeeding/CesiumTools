import * as Cesium from "cesium";
import centroid from "@turf/centroid";
import { polygon as tfpolygon } from "@turf/helpers";

const getPositionsCenter = (
  positions: Cesium.Cartesian3[],
  height?: number
) => {
  const polygon = tfpolygon([positions.map((item) => [item.x, item.y])]);
  const polyCenter = Cesium.BoundingSphere.fromPoints(positions).center;
  const polyCentroid = centroid(polygon);
  const center = new Cesium.Cartesian3(
    polyCentroid.geometry.coordinates[0],
    polyCentroid.geometry.coordinates[1],
    polyCenter.z
  );
  return {
    cartesian3: Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center),
    height,
  };
};

const updateEntityPosition = (entity: Cesium.Entity) => {
  if (entity.polygon) {
    const center = getPositionsCenter(
      entity.polygon?.hierarchy?.getValue(Cesium.JulianDate.now()).positions
    ).cartesian3;
    entity.position = new Cesium.ConstantPositionProperty(center);
    return;
  }
  if (entity.polyline) {
    const positions = entity.polyline.positions?.getValue(
      Cesium.JulianDate.now()
    );
    const center = positions[Math.floor(positions.length / 2)];
    entity.position = new Cesium.ConstantPositionProperty(center);
    return;
  }
};

export const updateDataSourcePosition = (dataSource: Cesium.DataSource) => {
  const entities = dataSource.entities.values;
  for (let i = 0; i < entities.length; i += 1) {
    const entity = entities[i];
    updateEntityPosition(entity);
  }
};
