import * as Cesium from "cesium";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Popup from "./Popup/index";

export default (gui: dat.GUI) => {
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
};
