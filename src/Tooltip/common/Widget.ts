import * as Cesium from "cesium";

class Widget {
  protected _viewer: Cesium.Viewer;
  protected _wrapper: HTMLElement;
  protected _ready: boolean;
  protected _enabled: boolean;
  constructor(viewer: Cesium.Viewer, wrapper: HTMLElement) {
    this._viewer = viewer;
    this._wrapper = wrapper;
    this._ready = false;
    this._enabled = false;
  }

  set enabled(enabled) {
    this._enabled = enabled;
    if (this._enableHook) this._enableHook();
  }

  get enabled() {
    return this._enabled;
  }

  get ready() {
    return this._ready;
  }

  protected _mountContent() {}

  protected _bindEvent() {}

  protected _unbindEvent() {}

  /**
   * 当enable修改，而执行的钩子函数
   * @private
   */
  private _enableHook() {
    if (!this._ready) this._mountContent();
    if (this._enabled) {
      if (!this._wrapper.parentNode) {
        this._viewer.container.appendChild(this._wrapper);
      }
      this._bindEvent();
    } else {
      this._unbindEvent();
      if (this._wrapper.parentNode) {
        this._viewer.container.removeChild(this._wrapper);
      }
    }
  }

  setContent(content: string | Element): Widget {
    if (content && typeof content === "string") {
      this._wrapper.innerHTML = content;
    } else if (content && content instanceof Element) {
      while (this._wrapper.hasChildNodes()) {
        if (this._wrapper.firstChild)
          this._wrapper.removeChild(this._wrapper.firstChild);
      }
      this._wrapper.appendChild(content);
    }
    return this;
  }

  hide() {
    if (this._wrapper) this._wrapper.style.display = "none";
  }

  show() {
    if (this._wrapper) this._wrapper.style.display = "block";
  }

  destroy() {
    this.enabled = false;
    this._ready = false;
  }
}

export default Widget;
