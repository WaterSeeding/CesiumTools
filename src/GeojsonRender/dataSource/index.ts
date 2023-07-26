import * as Cesium from "cesium";
import RenderConfig2Style from "../renderConfig2Style/index";
import type { GeoJsonRenderConfig } from "../_config/typing";
import type { EntityStyle } from "../_config/entityTyping";
import { dataSourceRender } from "./dataSource";

export const render = async (
  dataSource: Cesium.DataSource,
  config: GeoJsonRenderConfig
) => {
  const { type, style } = config;
  if (!type || !style) return undefined;

  const data = dataSource.entities.values.map((item) =>
    item.properties?.getValue(Cesium.JulianDate.now())
  );
  const entityStyle: EntityStyle = await RenderConfig2Style[type](
    data,
    style as any
  );
  entityStyle.label = style.symbol
    ? RenderConfig2Style.symbol(style.symbol)
    : undefined;
  if (entityStyle) await dataSourceRender(dataSource, entityStyle);
  return entityStyle;
};
