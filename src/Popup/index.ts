import * as Cesium from "cesium";
import EventEmitter from "./_utils/EventEmitter";

class Popup extends EventEmitter {
  open: boolean;
  offset: any;
  position: any;
  _panelContainer: HTMLElement | null | undefined;
  _viewer: Cesium.Viewer | null | undefined;
  _renderListener: Cesium.Event.RemoveCallback | null | undefined;

  constructor(options: any) {
    super();
    this.open = false;
    this.offset = options.offset || [0, 0];
  }

  initPanle() {
    try {
      this._panelContainer!.style.display = "block";
      // @ts-ignore
      this.trigger("open");
      this.open = true;
    } catch (e) {
      console.warn("初始化面板警告", e);
    }
  }

  setHTML(html: HTMLElement) {
    this._panelContainer = html;
  }

  setPosition(cartesian3: Cesium.Cartesian3) {
    this.position = cartesian3;
  }

  setOffset(offset: any) {
    this.offset = offset;
  }

  add(viewer: Cesium.Viewer) {
    if (this._viewer) this.remove();
    this._viewer = viewer;
    this.initPanle();
    if (this.position) {
      // postRender: 获取将在场景渲染后立即引发的事件。
      // 事件的订阅者接收场景实例作为第一个参数，当前时间作为第二个参数。
      this._renderListener = this._viewer.scene.postRender.addEventListener(
        this.render,
        this
      );
    }
  }

  remove() {
    if (this._panelContainer) {
      this._panelContainer!.style.display = "none";
      this._panelContainer = null;
    }

    if (this._renderListener) {
      this._renderListener();
      this._renderListener = null;
    }

    if (this._viewer) {
      this._viewer = null;
    }
    // @ts-ignore
    this.trigger("close");
    this.open = false;
  }

  render() {
    let geometry = this.position;
    if (!geometry) return;

    let position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      this._viewer!.scene,
      geometry
    );
    if (!position) {
      return;
    }

    if (this._panelContainer) {
      this._panelContainer.style.left = position.x + this.offset[0] + "px";
      this._panelContainer.style.top = position.y + this.offset[1] + "px";
    }
  }
}

export default Popup;
