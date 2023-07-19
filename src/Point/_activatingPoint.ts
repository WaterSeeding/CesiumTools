import * as Cesium from "cesium";

const activatingPoint = (
  _self: {
    activatingEntity: Cesium.Entity | undefined;
    [propName: string]: any;
  },
  targetEntity: Cesium.Entity
) => {
  let data = targetEntity.properties!.getValue(new Cesium.JulianDate());
  let activatingImg = data.url.active;
  targetEntity.billboard!.image = new Cesium.ConstantProperty(activatingImg);
  _self.activatingEntity = targetEntity;
};

export default activatingPoint;
