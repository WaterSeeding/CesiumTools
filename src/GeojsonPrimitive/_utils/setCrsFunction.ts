import * as Cesium from "cesium";

import {
  crsLinkHrefs,
  crsLinkTypes,
  crsNames,
  defaultCrsFunction,
} from "../LayerUtils";

// 设置坐标参考系函数
const setCrsFunction = (crs: any) => {
  let crsFunction = crs !== null ? defaultCrsFunction : null;

  if (Cesium.defined(crs)) {
    if (!Cesium.defined(crs.properties)) {
      throw new Cesium.RuntimeError("crs.properties is undefined.");
    }

    const properties = crs.properties;
    if (crs.type === "name") {
      crsFunction = crsNames[properties.name];
      if (!Cesium.defined(crsFunction)) {
        throw new Cesium.RuntimeError(`Unknown crs name: ${properties.name}`);
      }
    } else if (crs.type === "link") {
      let handler = crsLinkHrefs[properties.href];
      if (!Cesium.defined(handler)) {
        handler = crsLinkTypes[properties.type];
      }

      if (!Cesium.defined(handler)) {
        throw new Cesium.RuntimeError(
          `Unable to resolve crs link: ${JSON.stringify(properties)}`
        );
      }

      crsFunction = handler(properties);
    } else if (crs.type === "EPSG") {
      crsFunction = crsNames[`EPSG:${properties.code}`];
      if (!Cesium.defined(crsFunction)) {
        throw new Cesium.RuntimeError(
          `Unknown crs EPSG code: ${properties.code}`
        );
      }
    } else {
      throw new Cesium.RuntimeError(`Unknown crs type: ${crs.type}`);
    }
  }

  return crsFunction;
};

export default setCrsFunction;
