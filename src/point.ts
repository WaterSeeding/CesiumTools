import * as Cesium from "cesium";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Camera from "./Camera/index";
import Points from "./Point/Points";
import JianchuwentiPointData from "./PointData/jianchuwenti";
import JianchuwentDaichuzhiiPointData from "./PointData/jianchuwenti_daichuzhi";
import JianchuwentChuzhizhongPointData from "./PointData/jianchuwenti_chuzhizhong";

export default (camera: Camera, gui: dat.GUI) => {
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
};
