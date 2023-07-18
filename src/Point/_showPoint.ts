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
  namesData: object,
  cb?: Function
): any => {
  Object.entries(namesData).forEach(([key, data]) => {
    if (names.includes(key)) {
      let id = `Point_${key}`;
      let hadCollections = entityCollections.filter(
        (entityCollection: entityCollectionType) => entityCollection.id === id
      );
      if (hadCollections?.length > 0) {
        let collection = hadCollections[0].collection;
        collection.show = true;
        data.features.forEach((item: any) => {
          let id = `Point_${key}_${item.properties.id}`;
          let isHadId = collection.getById(id);
          if (!isHadId) {
            // console.log('Point Id不存在:', id);
            additionalPoint(viewer, key, item, collection);
          } else {
            // console.log('Point Id存在:', id);
          }
        });
      } else {
        cb?.(key, data);
      }
    }
  });
};

export default showPoint;
