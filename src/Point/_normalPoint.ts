import * as Cesium from "cesium";
import { setPointNormalImg } from './_setPointImg';

const normalPoint = async (
  _self: {
    activatingEntity: Cesium.Entity | undefined;
    [propName: string]: any;
  },
  cb?: Function,
) => {
  if (_self.activatingEntity?.id) {
    let currentActivatingInfo = _self.activatingEntity.properties!.getValue(
      new Cesium.JulianDate(),
    );
    let currentActivatingName = currentActivatingInfo.type;
    let normalImg = await setPointNormalImg(
      currentActivatingName,
      currentActivatingInfo.info,
    );
    if (_self.activatingEntity?.billboard) {
      _self.activatingEntity.billboard!.image = new Cesium.ConstantProperty(
        normalImg,
      );
      _self.activatingEntity = undefined;
    }
  }

  cb?.();
};

export default normalPoint;
