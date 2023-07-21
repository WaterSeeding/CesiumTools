import "./app.css";
import * as Cesium from "cesium";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Clock from "./Clock/index";
import Camera from "./Camera/index";
import DirectionalLight from "./DirectionalLight/index";
import createPopup from "./popup";
import graphics from "./GradientLightWall/index";
import arcgis from "./Layer/arcgis";

const gui = new dat.GUI({
  name: "Cesium GUI",
  width: 450,
  autoPlace: true,
  closed: false,
});
gui.domElement.id = "gui";
gui.show();

let clock = new Clock(viewer);
clock.setTime("2023-07-01 08:00:00");

let camera = new Camera(viewer, gui, {
  position: {
    longitude: 104.032564,
    latitude: 30.603415,
    height: 1755,
  },
  // degrees
  headingPitchRoll: {
    heading: 48.21719,
    pitch: -23.048826,
    roll: 0.005558,
  },
});

let directionalLight = new DirectionalLight(viewer, gui);
createPopup(gui);

let tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: "./static/building/tileset.json",
  })
);
tileset.style = new Cesium.Cesium3DTileStyle({
  color: {
    conditions: [
      ["${height} >= 300", "rgba(0, 149, 251, 0.3)"],
      ["${height} >= 200", "rgb(0, 149, 251, 0.3)"],
      ["${height} >= 100", "rgb(0, 149, 251, 0.3)"],
      ["${height} >= 50", "rgb(0, 149, 251, 0.3)"],
      ["${height} >= 25", "rgb(0, 149, 251, 0.3)"],
      ["${height} >= 10", "rgb(0, 149, 251, 0.3)"],
      ["${height} >= 5", "rgb(0, 149, 251, 0.3)"],
      ["true", "rgb(0, 149, 251, 0.3)"],
    ],
  },
});

graphics.setDynamicShadeWallGraphics({
  positions: Cesium.Cartesian3.fromDegreesArrayHeights([
    104.07263175401185, 30.647622150198725, 500.0, 104.06369117158526,
    30.648834374000277, 500.0, 104.06437182811021, 30.62274533905387, 500.0,
    104.07463538167119, 30.62285687644371, 500.0, 104.07263175401185,
    30.647622150198725, 500.0,
  ]),
});

arcgis(gui);
