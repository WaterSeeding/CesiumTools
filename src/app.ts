import "./app.css";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Camera from "./Camera/index";
import Clock from "./Clock/index";
import DirectionalLight from "./DirectionalLight/index";
import Points from "./Point/Points";

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

let points_func = {
  show: () => {
    console.log("显示撒点");
  },
  hide: () => {
    console.log("隐藏撒点");
  },
};

gui.add(points_func, "show").name("显示撒点");
gui.add(points_func, "hide").name("隐藏撒点");
