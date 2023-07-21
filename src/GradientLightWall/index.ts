import { Base } from "./Base";
import { Graphics } from "./Graphics";
import * as Cesium from "cesium";
import { viewer } from "../main";

const clone = (extendObj: any, baseObj: any) => {
  let keys = Object.keys(baseObj.prototype);
  for (let i = 0, len = keys.length; i < len; i++) {
    extendObj.prototype[keys[i]] = baseObj.prototype[keys[i]];
  }
};

const prototypeExtends = (viewer: Cesium.Viewer) => {
  return (baseObj: any, extendObj: any) => {
    let obj: any = null;
    clone(extendObj, baseObj);
    obj = new extendObj(viewer);
    return obj;
  };
};

const protoExtends = prototypeExtends(viewer);
const graphics = protoExtends(Base, Graphics);

export default graphics;
