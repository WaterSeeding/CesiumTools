import * as Cesium from "cesium";

const setPoint = (
  viewer: Cesium.Viewer,
  entityCollection: Cesium.EntityCollection,
  id: string,
  name: string,
  pos: number[],
  img: HTMLImageElement,
  info: any,
  url: {
    normal: string;
    active: string;
  }
) => {
  return new Promise(async (resolve, reject) => {
    if (!pos[0] && !pos[1]) resolve(null);
    try {
      let entityPosition: any = null;
      let position = Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 0);
      entityPosition = position;
      if (viewer.scene.clampToHeightSupported) {
        let clampToHeightCartesiansArr =
          await viewer.scene.clampToHeightMostDetailed([position]);
        if (clampToHeightCartesiansArr && clampToHeightCartesiansArr[0])
          entityPosition = clampToHeightCartesiansArr[0];
      }
      entityPosition = Cesium.Cartesian3.add(
        entityPosition,
        new Cesium.Cartesian3(0, 20, 0),
        new Cesium.Cartesian3()
      );
      let entity = viewer.entities.add({
        id: id,
        name: id,
        position: entityPosition,
        properties: {
          info,
          type: name,
          url,
        },
        billboard: {
          image: new Cesium.ConstantProperty(img),
          color: Cesium.Color.WHITE.withAlpha(1),
          height: img.height * 0.4,
          width: img.width * 0.4,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 2000, 0.5),
        },
        show: true,
      });
      entityCollection.add(entity);
      resolve("设置撒点成功!");
    } catch (e) {
      reject("设置撒点出错!");
    }
  });
};

export default setPoint;
