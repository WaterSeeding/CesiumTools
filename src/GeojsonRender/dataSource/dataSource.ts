import * as Cesium from "cesium";
import BillBuilder from "./BillBuilder";
import { custom2value, getEntityValue } from "../renderConfig2Style/renderTool";
import type { EntityStyle, CustomPaintItem } from "../_config/entityTyping";

export const dataSourceRender = async (
  dataSource: Cesium.DataSource,
  style: EntityStyle
) => {
  const entities = dataSource.entities.values;
  const { label, paint, type, custom } = style;
  entities.map((entity) => {
    const customStyle: Record<string, any> = {};

    for (const k in custom) {
      if (custom[k as keyof typeof custom]) {
        const config = custom[k as keyof typeof custom] as CustomPaintItem;
        config.default =
          config.custom?.find((item) => item.label === "default")?.value ??
          config.default;
        const entityVal = getEntityValue(entity, config.field);
        const value = custom2value(entityVal, config);
        customStyle[k] = value;
      }
    }

    switch (type) {
      case "point":
        entity.point = undefined;
        entity.billboard = undefined;
        entity.cylinder = undefined;

        if (style.layout?.image || customStyle.image) {
          const billboardStyle = {
            ...style.layout,
            ...customStyle,
          };
          if (billboardStyle.image) {
            entity.billboard = new Cesium.BillboardGraphics(billboardStyle);
          }
        } else {
          // 如果是圆柱体
          if (style.cylinder) {
            const { cylinder } = style;
            const length = (customStyle?.length ?? 1) * 1000;
            entity.cylinder = new Cesium.CylinderGraphics({
              ...cylinder,
              ...customStyle,
              length,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              topRadius: (cylinder?.topRadius ?? 1) * 1000,
              bottomRadius: (cylinder?.bottomRadius ?? 1) * 1000,
            });
          } else {
            // 如果是点
            entity.point = new Cesium.PointGraphics({
              ...paint,
              ...customStyle,
            });
          }
        }
        break;
      case "line":
        entity.polygon = undefined;
        entity.polyline = new Cesium.PolylineGraphics({
          positions: entity.polyline?.positions,
          ...paint,
          ...customStyle,
          clampToGround: true,
        });
        break;
      case "polygon":
        const height = customStyle?.extrudedHeight;
        entity.polygon = new Cesium.PolygonGraphics({
          hierarchy: entity.polygon?.hierarchy,
          ...paint,
          ...customStyle,
          extrudedHeight: height ? height * 1000 : undefined,
        });
        entity.polyline = new Cesium.PolylineGraphics({
          positions: (entity.polygon.hierarchy as any)?._value.positions,
          width: paint.outlineWidth,
          material: paint.outlineColor,
          clampToGround: true,
        });
        break;
      case "mix":
        if (entity.billboard) {
          if (paint.markerSymbol) {
            entity.point = undefined;
            entity.billboard.show = new Cesium.ConstantProperty(true);
            entity.billboard = new Cesium.BillboardGraphics({
              image: paint.markerSymbol,
              color: paint.markerColor,
              scale: (paint.markerSize ?? 5) / 5,
            });
          } else {
            entity.billboard.show = new Cesium.ConstantProperty(false);
            entity.point = new Cesium.PointGraphics({
              color: paint.markerColor,
              outlineColor: paint.stroke,
              outlineWidth: paint.strokeWidth,
              pixelSize: paint.markerSize,
            });
          }
        }
        entity.polyline = new Cesium.PolylineGraphics({
          positions: entity.polyline?.positions,
          material: paint.fill,
          width: paint.strokeWidth,
          clampToGround: true,
        });

        if (entity.polygon) {
          entity.polygon = new Cesium.PolygonGraphics({
            hierarchy: entity.polygon?.hierarchy,
            material: paint.fill,
          });
          entity.polyline = new Cesium.PolylineGraphics({
            positions: (entity.polygon.hierarchy as any)?._value.positions,
            width: paint.strokeWidth,
            material: paint.stroke,
            clampToGround: true,
          });
        }

        break;
    }
    if (label?.paint.text) {
      entity.label = new Cesium.LabelGraphics({
        font: `bold 20px Arial`,
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        scale: 1,
        scaleByDistance: new Cesium.NearFarScalar(1, 0.85, 8.0e6, 0.75),
        ...label.paint,
        text: label.paint.text?.replace(
          /\{([^\{]*)\}/g,
          (match, p1) => getEntityValue(entity, p1) ?? ""
        ),
      });
    } else entity.label = undefined;
  });

  if (style.type === "point") {
    dataSourceCluster(dataSource, style.cluster);
  }
};

function dataSourceCluster(
  dataSource: Cesium.DataSource,
  options: {
    enable?: boolean;
    pixelRange?: number;
    minimumClusterSize?: number;
    colors?: string[];
    alpha?: number;
    scale?: number;
    maxNum?: number;
  } = {}
) {
  const { enable = false, pixelRange = 80, minimumClusterSize = 2 } = options;

  dataSource.clustering.enabled = enable;
  dataSource.clustering.pixelRange = pixelRange;
  dataSource.clustering.minimumClusterSize = minimumClusterSize;

  dataSource.clustering.clusterEvent.removeEventListener(clusterEvent);
  if (enable)
    dataSource.clustering.clusterEvent.addEventListener(
      (clusteredEntities, cluster) =>
        clusterEvent(clusteredEntities, cluster, options)
    );
}

const clusterEvent = (
  clusteredEntities: Cesium.Entity[],
  cluster: {
    billboard: Cesium.Billboard;
    label: Cesium.Label;
    point: Cesium.PointPrimitive;
  },
  options: {
    alpha?: number;
    scale?: number;
    colorBar?: string[];
    maxNum?: number;
  } = {}
) => {
  const {
    alpha = 1,
    scale = 1,
    colorBar = [
      "#313695",
      "#4575b4",
      "#74add1",
      "#abd9e9",
      "#e0f3f8",
      "#ffffbf",
      "#fee090",
      "#fdae61",
      "#f46d43",
      "#d73027",
      "#a50026",
    ],
    maxNum = 1000,
  } = options;

  cluster.billboard.show = true;
  cluster.label.show = false;
  cluster.billboard.id = cluster.label.id;
  cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.CENTER;
  const length = clusteredEntities.length;
  const numSize = length.toString().length;
  const helpNum = Math.pow(10, numSize - 1);
  if (length <= maxNum) {
    const num = numSize > 1 ? ~~(length / helpNum) * helpNum : length;
    cluster.billboard.image = new BillBuilder()
      .fromText(
        num >= 10 ? `${num}+` : String(length),
        Cesium.Color.fromCssColorString(
          colorBar[Math.floor((length / maxNum) * colorBar.length)] ??
            colorBar[colorBar.length - 1]
        ),
        80 + (length / maxNum) * 100
      )
      .toDataURL();
  } else {
    cluster.billboard.image = new BillBuilder()
      .fromText(
        `${length}`,
        Cesium.Color.fromCssColorString(colorBar[colorBar.length - 1]),
        180
      )
      .toDataURL();
  }

  cluster.billboard.color.alpha = alpha;
  cluster.billboard.scale = scale;
};
