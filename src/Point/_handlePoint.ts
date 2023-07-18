import * as Cesium from "cesium";

export const openPointEvent = (
  viewer: Cesium.Viewer,
  _self: {
    handler: Cesium.ScreenSpaceEventHandler | null;
    [propName: string]: any;
  },
  scale?: any,
  cb?: Function,
) => {
  if (!_self.handler || _self.handler!.isDestroyed()) {
    _self.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    _self.handler?.setInputAction((movement: any) => {
      if (scale) {
        movement.position.x = movement.position.x / scale.scaleX;
        movement.position.y = movement.position.y / scale.scaleY;
      }
      let pick = viewer.scene.pick(movement.position);
      if (
        Cesium.defined(pick) &&
        pick?.id?.id &&
        pick.id.id.indexOf('Point') > -1
      ) {
        let pickEntity = pick.id;
        let pickNames = pickEntity?._id.split('_');
        if (pickNames?.length && pickNames.length > 0) {
          let pickName = pickNames[1];
          cb?.(pickEntity, pickName);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
};

export const closePointEvent = (_self: {
  handler: Cesium.ScreenSpaceEventHandler | null;
  [propName: string]: any;
}) => {
  if (_self.handler && !_self.handler.isDestroyed()) {
    _self.handler.destroy();
    _self.handler = null;
  }
};
