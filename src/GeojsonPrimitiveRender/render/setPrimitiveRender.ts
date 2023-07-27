import * as Cesium from "cesium";
import type {
  EntityStyle,
  CustomPaintItem,
  CylinderEntityConstructor,
} from "../_config/entityTyping";

import { custom2value } from "../_styles/renderTool";
import GeoJsonPrimitiveLayer, {
  BillboardPrimitiveItem,
  CirclePrimitiveItem,
  PointPrimitiveItem,
  PolylinePrimitiveItem,
  PolygonPrimitiveItem,
} from "../../GeojsonPrimitive";

export const setPrimitiveRender = async (
  primitiveLayer: GeoJsonPrimitiveLayer,
  style: EntityStyle
) => {
  const featureItems = [...primitiveLayer.featureItems];
  primitiveLayer.removeAllPrimitive();
  const { label, paint, type, custom } = style;
  featureItems.map((feature) => {
    const customStyle: any = {};

    for (const k in custom) {
      if (custom[k as keyof typeof custom]) {
        const config = custom[k as keyof typeof custom] as CustomPaintItem;
        config.default =
          config.custom?.find((item) => item.label === "default")?.value ??
          config.default;
        const featureVal = feature.properties?.[config.field ?? ""];
        const value = custom2value(featureVal, config);
        customStyle[k] = value;
      }
    }

    const height = customStyle?.extrudedHeight;
    const extrudedHeight = height ? height * 1000 : undefined;

    switch (type) {
      case "point":
        if (style.layout?.image) {
          primitiveLayer.addBillboard({
            ...(feature as BillboardPrimitiveItem),
            style: {
              ...style.layout,
              ...customStyle,
            },
          });
        }
        // 如果不是图标
        if (!style.layout?.image) {
          // 如果是圆柱体
          if (style.cylinder) {
            const { cylinder } = style;
            const cylinderStyle: CylinderEntityConstructor = {
              ...cylinder,
              ...customStyle,
            };
            primitiveLayer.addCircle({
              ...(feature as CirclePrimitiveItem),
              style: {
                color: cylinderStyle.material,
                radius: (cylinderStyle.bottomRadius ?? 1) * 1000,
                extrudedHeight: (cylinderStyle.length ?? 0) * 1000,
              },
            });
          } else {
            // 如果是点
            primitiveLayer.addPoint({
              ...(feature as PointPrimitiveItem),
              style: {
                ...paint,
                ...customStyle,
              },
            });
          }
        }
        break;
      case "line":
        primitiveLayer.addPolyline({
          ...(feature as PolylinePrimitiveItem),
          style: {
            ...paint,
            ...customStyle,
            extrudedHeight,
          },
        });
        break;
      case "polygon":
        primitiveLayer.addPolygon({
          ...(feature as PolygonPrimitiveItem),
          style: {
            ...paint,
            ...customStyle,
            extrudedHeight,
          },
        });
        break;
      case "mix":
        if (feature.type === "Point" || feature.type === "Billboard") {
          if (paint.markerSymbol) {
            primitiveLayer.addBillboard({
              ...(feature as BillboardPrimitiveItem),
              style: {
                image: paint.markerSymbol,
                color: paint.markerColor,
                scale: (paint.markerSize ?? 5) / 5,
              },
            });
          } else {
            primitiveLayer.addPoint({
              ...(feature as PointPrimitiveItem),
              style: {
                color: paint.markerColor,
                outlineColor: paint.stroke,
                outlineWidth: paint.strokeWidth,
                pixelSize: paint.markerSize,
              },
            });
          }
        }
        if (feature.type === "Polygon") {
          primitiveLayer.addPolygon({
            ...feature,
            style: {
              material: paint.fill,
              outlineColor: paint.stroke,
              outlineWidth: paint.strokeWidth,
            },
          });
        }
        if (feature.type === "Polyline") {
          primitiveLayer.addPolyline({
            ...feature,
            style: {
              material: paint.fill,
              width: paint.strokeWidth,
            },
          });
        }
        break;
    }
    if (label?.paint.text) {
      primitiveLayer.addLabel({
        type: "Label",
        position: feature.center?.cartesian3,
        style: {
          font: `bold 20px Arial`,
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          scale: 1,
          scaleByDistance: new Cesium.NearFarScalar(1, 0.85, 8.0e6, 0.75),
          ...label.paint,
          text: label.paint.text?.replace(
            /\{([^\{]*)\}/g,
            (match, p1) => feature.properties?.[p1] ?? ""
          ),
        },
      });
    }
  });
  primitiveLayer.reloadPrimitive();
};
