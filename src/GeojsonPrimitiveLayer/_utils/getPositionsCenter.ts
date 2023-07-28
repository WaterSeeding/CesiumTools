import centroid from "@turf/centroid";
import { polygon as tfpolygon } from "@turf/helpers";
import { Cartesian3, BoundingSphere, Ellipsoid } from "cesium";

export default function getPositionsCenter(
  positions: Cartesian3[],
  height?: number
) {
  const polygon = tfpolygon([positions.map((item) => [item.x, item.y])]);
  const polyCenter = BoundingSphere.fromPoints(positions).center;
  const polyCentroid = centroid(polygon);
  const center = new Cartesian3(
    polyCentroid.geometry.coordinates[0],
    polyCentroid.geometry.coordinates[1],
    polyCenter.z
  );
  return {
    cartesian3: Ellipsoid.WGS84.scaleToGeodeticSurface(center),
    height,
  };
}
