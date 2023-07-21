import * as Cesium from "cesium";
import { viewer } from "../main";

class Graphics {
  graphicsLayer: Cesium.CustomDataSource;
  constructor(viewer: Cesium.Viewer) {
    this.graphicsLayer = new Cesium.CustomDataSource("graphicsLayer");
    viewer && viewer.dataSources.add(this.graphicsLayer);
  }

  setDynamicShadeWallGraphics(options: {
    positions: Cesium.Cartesian3[];
    alpha?: number;
    color?: Cesium.Color;
    speed?: number;
    number?: number;
  }) {
    if (options && options.positions) {
      let alpha = options.alpha || 1,
        color = options.color || Cesium.Color.RED,
        speed = options.speed || 0.003,
        number = options.number || 2;

      let wallEntity = new Cesium.Entity();
      let wallGraphics = new Cesium.WallGraphics({
        positions: options.positions,
        material: new Cesium.ImageMaterialProperty({
          image: "./static/img/fence.png",
          transparent: true,
          color: new Cesium.CallbackProperty(() => {
            if (number % 2 === 0) {
              alpha -= speed;
            } else {
              alpha += speed;
            }

            if (alpha <= 0.1 || alpha >= 1) {
              number++;
            }
            return color.withAlpha(alpha);
          }, false),
        }),
      });
      wallEntity.wall = wallGraphics;
      return this.graphicsLayer.entities.add(wallEntity);
    }
  }
}

const graphics = new Graphics(viewer);

export default graphics;
