import "./app.css";
import * as Cesium from "cesium";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Camera from "./Camera/index";
import Clock from "./Clock/index";
import DirectionalLight from "./DirectionalLight/index";
import Points from "./Point/Points";
import Popup from "./Popup/index";
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
      ["检出问题"]: {
        data: JianchuwentiPointData,
        img: {
          normal: "./img/检出问题.png",
          active: "./img/检出问题_active.png",
        },
      },
      ["检出问题_待处置"]: {
        data: JianchuwentDaichuzhiiPointData,
        img: {
          normal: "./img/检出问题_待处置.png",
          active: "./img/检出问题_待处置_active.png",
        },
      },
      ["检出问题_处置中"]: {
        data: JianchuwentChuzhizhongPointData,
        img: {
          normal: "./img/检出问题_处置中.png",
          active: "./img/检出问题_处置中_active.png",
        },
      },
    },
    (data: any) => {
      console.log("[setPrepareCb]事件");
    },
    (position: Cesium.Cartesian3, info: any, name: string) => {
      console.log("[setActivatingCb]事件");
    },
    () => {
      console.log("[setNormalCb]事件");
    }
  );
};

const hidePoint = () => {
  points.setHide();
};

let points_folder = gui.addFolder("Points");
points_folder.close();

let points_func = {
  show: () => {
    showPoint(["检出问题", "检出问题_待处置", "检出问题_处置中"]);
  },
  hide: () => {
    hidePoint();
  },
};

points_folder.add(points_func, "show").name("显示撒点");
points_folder.add(points_func, "hide").name("隐藏撒点");

let popup = new Popup({});
const setPopupOpen = (
  viewer: Cesium.Viewer,
  position: Cesium.Cartesian3,
  popupHtml: HTMLElement,
  openCb?: Function,
  closeCb?: Function
) => {
  if (popup.open) {
    return false;
  }
  popup.on("open", function () {
    openCb && openCb();
  });
  popup.on("close", function () {
    closeCb && closeCb();
  });
  popup.setPosition(position);
  popup.setHTML(popupHtml);
  popup.add(viewer);
};

const setPopupClose = () => {
  if (!popup.open) {
    return false;
  }
  popup.remove();
};

let popup_folder = gui.addFolder("Popup");
popup_folder.close();

let popup_func = {
  show: () => {
    let position = Cesium.Cartesian3.fromDegrees(
      114.05104099176157,
      22.509032825095247,
      100
    );
    let popupHtml = document.getElementById("popup");
    setPopupOpen(viewer, position, popupHtml);
  },
  hide: () => {
    setPopupClose();
  },
};

popup_folder.add(popup_func, "show").name("显示弹窗");
popup_folder.add(popup_func, "hide").name("隐藏弹窗");
