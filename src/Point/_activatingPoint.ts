import * as Cesium from "cesium";
import { setPointActivatingImg } from './_setPointImg';

const activatingPoint = async (
  _self: {
    activatingEntity: Cesium.Entity | undefined;
    [propName: string]: any;
  },
  targetEntity: Cesium.Entity,
) => {
  let data = targetEntity.properties!.getValue(new Cesium.JulianDate());
  let activatingImg = await setPointActivatingImg(data.type, data.info);
  targetEntity.billboard!.image = new Cesium.ConstantProperty(activatingImg);
  _self.activatingEntity = targetEntity;
};

export default activatingPoint;
