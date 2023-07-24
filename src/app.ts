import "./app.css";
import * as Cesium from "cesium";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Clock from "./Clock/index";
import Camera from "./Camera/index";
import DirectionalLight from "./DirectionalLight/index";
import Subscriber from "./Subscriber/index";

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
    longitude: 104.050783,
    latitude: 30.616141,
    height: 782,
  },
  // degrees
  headingPitchRoll: {
    heading: 48.21719,
    pitch: -23.048826,
    roll: 0.005558,
  },
});

let directionalLight = new DirectionalLight(viewer, gui);

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

let box = viewer.entities.add({
  name: "Blue box",
  position: Cesium.Cartesian3.fromDegrees(104.060783, 30.626141, 0),
  box: {
    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    dimensions: new Cesium.Cartesian3(100.0, 100.0, 250),
    material: Cesium.Color.BLUE,
  },
});

let subscriber = new Subscriber(viewer, {
  element: viewer.canvas,
  pickResult: {
    enable: true,
    moveDebounce: 0,
  },
});

let eId: string = "";

let obj = {
  add: () => {
    subscriber.add(
      box,
      (move: any, result: any) => {
        console.log("result", result);
      },
      "LEFT_CLICK"
    );
  },
  remove: () => {
    subscriber.remove(box, "LEFT_CLICK");
  },
  addExternal: () => {
    if (!eId) {
      eId = subscriber.addExternal((move: any, result: any) => {
        if (result) {
          viewer.canvas.style.cursor = "pointer";
        } else {
          viewer.canvas.style.cursor = "default";
        }
      }, "MOUSE_MOVE");
    }
  },
  removeExternal: () => {
    if (eId) {
      subscriber.removeExternal(eId);
      eId = "";
      viewer.canvas.style.cursor = "default";
    }
  },
  destroy: () => {
    subscriber.destroy();
  },
};

let subscriber_folder = gui.addFolder("Subscriber");
subscriber_folder.add(obj, "add").name("add订阅事件");
subscriber_folder.add(obj, "remove").name("remove销毁事件");
subscriber_folder.add(obj, "addExternal").name("addExternal订阅事件");
subscriber_folder.add(obj, "removeExternal").name("removeExternal销毁事件");
subscriber_folder.add(obj, "destroy").name("destroy销毁事件");
