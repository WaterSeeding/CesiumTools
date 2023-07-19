import * as Cesium from "cesium";

const normalPoint = (
  _self: {
    activatingEntity: Cesium.Entity | undefined;
    [propName: string]: any;
  },
  cb?: Function
) => {
  if (_self.activatingEntity?.id) {
    let currentActivatingInfo = _self.activatingEntity.properties!.getValue(
      new Cesium.JulianDate()
    );
    let normalImg = currentActivatingInfo.url.normal;
    if (_self.activatingEntity?.billboard) {
      _self.activatingEntity.billboard!.image = new Cesium.ConstantProperty(
        normalImg
      );
      _self.activatingEntity = undefined;
    }
  }

  cb?.();
};

export default normalPoint;
