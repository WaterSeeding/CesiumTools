import type { GeoJsonRenderConfig } from "../_config/typing";
import type { EntityStyle } from "../_config/entityTyping";
import RenderConfig2Style from "../_styles/index";

import GeoJsonPrimitiveLayer from "../../GeojsonPrimitiveLayer";
import { setPrimitiveRender } from "./setPrimitiveRender";

export const GeoJsonPrimitiveRender = async (
  primitiveLayer: GeoJsonPrimitiveLayer,
  config: GeoJsonRenderConfig
) => {
  const { type, style } = config;
  if (!type || !style) return;

  const data = primitiveLayer.featureItems
    .map((feature) => feature.properties)
    .filter((item) => item !== undefined);
  const entityStyle: EntityStyle = await RenderConfig2Style[type](
    data as any,
    style as any
  );
  entityStyle.label = style.symbol
    ? RenderConfig2Style.symbol(style.symbol)
    : undefined;
  if (entityStyle) await setPrimitiveRender(primitiveLayer, entityStyle);
  return entityStyle;
};
