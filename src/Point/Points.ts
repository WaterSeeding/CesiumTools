import * as Cesium from "cesium";
import Point from "./Point";
import { addPoint } from "./_addPoint";
import showPoint from "./_showPoint";
import hidePoint from "./_hidePoint";
import normalPoint from "./_normalPoint";
import activatingPoint from "./_activatingPoint";
import { openPointEvent, closePointEvent } from "./_handlePoint";

export interface entityCollectionType {
  id: string;
  collection: Cesium.EntityCollection;
}

class Points extends Point {
  viewer: Cesium.Viewer;
  entityCollections: entityCollectionType[];
  entityCollectionNames: string[];
  activatingEntity: Cesium.Entity | undefined;
  handler: Cesium.ScreenSpaceEventHandler | null;
  constructor(viewer: Cesium.Viewer) {
    super(viewer);
    this.viewer = viewer;
    this.entityCollections = [];
    this.entityCollectionNames = [];
    this.handler = null;
  }

  public async reqPointInfo(
    name: string,
    data: any[],
    setPrepareCb?: Function
  ) {
    let resData = await addPoint(
      this.entityCollections,
      this.viewer,
      name,
      data
    );
    if (resData && resData.length > 0) {
      this.entityCollectionNames = [...this.entityCollectionNames, resData[0]];
      setPrepareCb?.(this.entityCollectionNames);
    }
  }

  private activatingPointIcon = (
    targetEntity: Cesium.Entity,
    name: string,
    setActivatingCb?: Function,
    setNormalCb?: Function
  ) => {
    try {
      if (this.activatingEntity?.id) {
        if (this.activatingEntity.id === targetEntity.id) {
          normalPoint(this);
          setNormalCb?.();
          this.flyBackOrigin();
        } else {
          normalPoint(this);
          this.setActivatingPoint(targetEntity, name, setActivatingCb);
        }
      } else {
        this.setActivatingPoint(targetEntity, name, setActivatingCb);
      }
    } catch (e) {
      console.warn("撒点激活异常");
    }
  };

  public setActivatingPoint(
    targetEntity: Cesium.Entity,
    name: string,
    setActivatingCb?: Function
  ) {
    activatingPoint(this, targetEntity);
    setActivatingCb?.(
      targetEntity.position!.getValue(new Cesium.JulianDate()),
      targetEntity.properties!.info._value,
      name
    );
    this.flytoPointIcon(this.viewer, targetEntity, () => {});
  }

  public setNormalPoint() {
    normalPoint(this, () => {
      this.flyBackOrigin();
    });
  }

  public async setShows(
    names: string[],
    namesData: object,
    setPrepareCb?: Function,
    setActivatingCb?: Function,
    setNormalCb?: Function,
    scale?: any
  ) {
    await hidePoint(this.entityCollections);

    if (names && names.length > 0) {
      showPoint(
        this.viewer,
        this.entityCollections,
        names,
        namesData,
        (key: string, data: any) => {
          this.reqPointInfo(key, data.features, setPrepareCb);
        }
      );
      openPointEvent(
        this.viewer,
        this,
        scale,
        (pickEntity: any, pickName: any) => {
          this.activatingPointIcon(
            pickEntity,
            pickName,
            setActivatingCb,
            setNormalCb
          );
        }
      );
    }
  }

  public async setHide() {
    await hidePoint(this.entityCollections);
    closePointEvent(this);

    this.setNormalPoint();
  }

  public setCall(
    id: string,
    setActivatingCb?: Function,
    setNormalCb?: Function
  ) {
    let pickEntity = this.viewer.entities.getById(id);
    let pickNames = id.split("_");
    if (pickNames?.length && pickNames.length > 0 && pickEntity) {
      let pickName = pickNames[1];
      this.activatingPointIcon(
        pickEntity,
        pickName,
        setActivatingCb,
        setNormalCb
      );
    }
  }
}

export default Points;
