import { Base } from "./Base";
import { Graphics } from "./Graphics";
import * as Cesium from "cesium";
import { viewer } from "../main";

const clone = (children: any, cloneTarget: any) => {
  let keys = Object.keys(cloneTarget.prototype);
  for (let i = 0, len = keys.length; i < len; i++) {
    children.prototype[keys[i]] = cloneTarget.prototype[keys[i]];
  }
};

const prototypeExtends = (viewer: Cesium.Viewer) => {
  return (parents: any, children: any) => {
    let obj: any = null;
    if (Array.isArray(parents)) {
      parents.forEach((p) => {
        clone(children, p);
      });
      obj = new children(viewer);
      parents.forEach((pp) => {
        pp.call(obj, viewer);
      });
    } else {
      clone(children, parents);
      obj = new children(viewer);
      parents.call(obj, viewer);
    }
    return obj;
  };
};

const protoExtends = prototypeExtends(viewer);
const graphics = protoExtends(Base, Graphics);

export default graphics;
