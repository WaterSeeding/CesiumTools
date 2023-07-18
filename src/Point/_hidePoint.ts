import * as Cesium from "cesium";

export interface entityCollectionType {
  id: string;
  collection: Cesium.EntityCollection;
}

const hidePoint = (entityCollections: entityCollectionType[]) => {
  return new Promise((resolve, reject) => {
    if (entityCollections.length > 0) {
      entityCollections.forEach(
        (entityCollection: entityCollectionType, index: number) => {
          let collection = entityCollection.collection;
          collection.show = false;
          if (entityCollections.length === index + 1) {
            resolve(null);
          }
        },
      );
    } else {
      resolve(null);
    }
  });
};

export default hidePoint;
