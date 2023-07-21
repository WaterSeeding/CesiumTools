import * as Cesium from "cesium";
import { viewer } from "../main";
import { Control } from "./_Control";

let layer1 = viewer.imageryLayers.addImageryProvider(
  new Cesium.UrlTemplateImageryProvider({
    url: "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    credit: "",
  })
);
//@ts-ignore;
layer1.name = "影像";
//@ts-ignore;
layer1.id = "layer1";
layer1.show = false;

let layer2 = viewer.imageryLayers.addImageryProvider(
  new Cesium.UrlTemplateImageryProvider({
    url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
    credit: "",
  })
);
//@ts-ignore;
layer2.name = "电子";
//@ts-ignore;
layer2.id = "layer2";
layer2.show = false;

let layer3 = viewer.imageryLayers.addImageryProvider(
  new Cesium.ArcGisMapServerImageryProvider({
    url: "https://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer",
  })
);
//@ts-ignore;
layer3.name = "地形";
//@ts-ignore;
layer3.id = "layer3";
layer3.show = false;

let layer4 = viewer.imageryLayers.addImageryProvider(
  new Cesium.ArcGisMapServerImageryProvider({
    url: "https://services.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer",
  })
);
//@ts-ignore;
layer4.name = "地形2";
//@ts-ignore;
layer4.id = "layer4";
layer4.show = false;

let control = new Control(viewer);

export default (dat: dat.GUI) => {
  control.showLayerSwitchPanel([layer1, layer2, layer3, layer4], dat, 'Arcgis');
};
