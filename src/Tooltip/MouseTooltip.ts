import * as Cesium from "cesium";
import Tooltip, { TooltipOptions } from "./Tooltip";

export interface EventArgs {
  position?: Cesium.Cartesian2;
  endPosition?: Cesium.Cartesian2;
  startPosition?: Cesium.Cartesian2;
  [name: string]: any;
}

type MouseTooltipOptions = TooltipOptions;

class MouseTooltip extends Tooltip {
  private _handler: Cesium.ScreenSpaceEventHandler;
  private _destroyed = false;

  constructor(viewer: Cesium.Viewer, options: MouseTooltipOptions = {}) {
    super(viewer, options);
    this._handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this.enabled = true;
    this.showAt(new Cesium.Cartesian2(0, 0), this.content);
  }

  get destroyed() {
    return this._destroyed;
  }

  show() {
    if (this._destroyed) return;
    super.show();
    this._handler.setInputAction((movement: EventArgs) => {
      const { endPosition } = movement;
      if (endPosition) {
        const ray = this._viewer.camera.getPickRay(endPosition);
        if (!ray) return;
        const cartesian = this._viewer.scene.globe.pick(
          ray,
          this._viewer.scene
        );
        if (cartesian) this._updateWindowCoord(endPosition);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  hide() {
    if (this._destroyed) return;
    super.hide();
    this._handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  destroy() {
    this.enabled = false;
    if (!this._handler.isDestroyed()) {
      this._handler.destroy();
    }
    this._destroyed = true;
  }
}

export default MouseTooltip;
