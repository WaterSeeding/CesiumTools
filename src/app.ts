import "./app.css";
import * as Cesium from "cesium";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Camera from "./Camera/index";
import Clock from "./Clock/index";
import DirectionalLight from "./DirectionalLight/index";
import Points from "./Point/Points";
import JianchuwentiPointData from "./PointData/jianchuwenti";
import JianchuwentDaichuzhiiPointData from "./PointData/jianchuwenti_daichuzhi";
import JianchuwentChuzhizhongPointData from "./PointData/jianchuwenti_chuzhizhong";

const gui = new dat.GUI({
  name: "Cesium GUI",
  width: 450,
  autoPlace: true,
  closed: false,
});
gui.domElement.id = "gui";
gui.show();

const camera = new Camera(viewer, gui);

let clock = new Clock(viewer);
clock.setTime("2023-07-01 08:00:00");

let directionalLight = new DirectionalLight(viewer, gui);
let points = new Points(viewer);
points.on("flyFromPoint", () => {
  camera.setFly({
    position: {
      longitude: 114.035845,
      latitude: 22.479812,
      height: 1675,
    },
    headingPitchRoll: {
      heading: 22.7572,
      pitch: -21.334847,
      roll: 0,
    },
  });
});

const showPoint = (names: string[]) => {
  points.setShows(
    names,
    {
      ["检出问题"]: JianchuwentiPointData,
      ["检出问题_待处置"]: JianchuwentDaichuzhiiPointData,
      ["检出问题_处置中"]: JianchuwentChuzhizhongPointData,
    },
    (data: any) => {
      console.warn("[setPrepareCb]:", data);
    },
    (position: Cesium.Cartesian3, info: any, name: string) => {
      console.log("[setActivatingCb]", position, info, name);
    },
    () => {
      console.log("[setNormalCb]");
    }
  );
};

const hidePoint = () => {
  points.setHide();
};

let points_folder = gui.addFolder("Points");
points_folder.open();

let points_func = {
  show: () => {
    showPoint(["检出问题"]);
  },
  hide: () => {
    console.log("隐藏撒点");
    hidePoint();
  },
};

points_folder.add(points_func, "show").name("显示撒点");
points_folder.add(points_func, "hide").name("隐藏撒点");
