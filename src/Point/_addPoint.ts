import * as Cesium from "cesium";
import setPoint from "./_setPoint";

export interface entityCollectionType {
  id: string;
  collection: Cesium.EntityCollection;
}

export const addPoint = (
  entityCollections: entityCollectionType[],
  viewer: Cesium.Viewer,
  name: string,
  data: any[]
): any => {
  return new Promise((resolve, reject) => {
    if (data instanceof Array) {
      let promiseArr: any = [];
      let id = `Point_${name}`;
      let collection: any = new Cesium.EntityCollection();
      entityCollections.push({
        id: id,
        collection: collection,
      });
      let img = new Image();
      img.src = `./img/${name}.png`;
      img.onload = async () => {
        for (let i = 0; i < data.length; i++) {
          promiseArr.push(
            new Promise(async (resolve, reject) => {
              let id = `Point_${name}_${data[i].properties.id}`;
              try {
                let res = await setPoint(
                  viewer,
                  collection,
                  id,
                  name,
                  data[i].geometry.coordinates,
                  img,
                  data[i]
                );
              } catch (e) {
                console.warn("Points.addPointIcon方法出错提示:", e);
              }
              resolve(name);
            })
          );
        }
      };
      Promise.all(promiseArr).then((promiseAllReject) => {
        resolve(promiseAllReject);
      });
    } else {
      reject("");
    }
  });
};

export const additionalPoint = (
  viewer: Cesium.Viewer,
  name: string,
  data: any,
  collection: Cesium.EntityCollection
): void => {
  let img = new Image();
  img.src = `./img/${name}.png`;
  img.onload = () => {
    let id = `Point_${name}_${data.id}`;
    setPoint(viewer, collection, id, name, data.pos, img, data);
  };
};
