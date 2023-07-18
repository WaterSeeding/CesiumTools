import * as Cesium from "cesium";
import { directionalLightTable } from "./_db";
import { setGui } from "./_gui";
import { setParams } from "./_params";

export interface DirectionalLightParamsInterface {
  direction: {
    longitude: number;
    latitude: number;
    height?: number;
  };
  color: number[];
  intensity: number;
}

class DirectionalLight {
  viewer: Cesium.Viewer;
  light: Cesium.DirectionalLight;
  lightInitParams!: DirectionalLightParamsInterface;

  constructor(
    viewer: Cesium.Viewer,
    gui: dat.GUI,
    directionalLightParams?: DirectionalLightParamsInterface
  ) {
    this.viewer = viewer;
    this.light = new Cesium.DirectionalLight({
      direction: viewer.scene.camera.directionWC,
    });
    this.viewer.scene.light = this.light;

    setParams(this.light, directionalLightTable).then(
      (lightParams: DirectionalLightParamsInterface) => {
        this.lightInitParams = directionalLightParams || lightParams;
        setGui(
          gui,
          this.lightInitParams,
          this.light,
          (data: DirectionalLightParamsInterface) => {
            directionalLightTable.add(data);
          }
        );
      }
    );
  }
}

export default DirectionalLight;
