import * as Cesium from "cesium";
import { additionalPoint } from "./_addPoint";

export interface entityCollectionType {
  id: string;
  collection: Cesium.EntityCollection;
}

const showPoint = (
  viewer: Cesium.Viewer,
  entityCollections: entityCollectionType[],
  names: string[],
  namesInfo: {
    [propName: string]: {
      data: any;
      img: {
        normal: string;
        active: string;
      };
    };
  },
  cb?: (key: string, data: any) => void
): any => {
  Object.entries(namesInfo).forEach(([key, info]) => {
    if (names.includes(key)) {
      let id = `Point_${key}`;
      let hadCollections = entityCollections.filter(
        (entityCollection: entityCollectionType) => entityCollection.id === id
      );
      if (hadCollections?.length > 0) {
        let collection = hadCollections[0].collection;
        collection.show = true;
        info.data.features.forEach((item: any) => {
          let id = `Point_${key}_${item.properties.id}`;
          let isHadId = collection.getById(id);
          if (!isHadId) {
            additionalPoint(viewer, key, item, collection, info.img);
          } else {
          }
        });
      } else {
        cb?.(key, info);
      }
    }
  });
};

export default showPoint;
