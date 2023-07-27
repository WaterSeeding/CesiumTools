import "./app.css";
import * as Cesium from "cesium";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Clock from "./Clock/index";
import Camera from "./Camera/index";
import DirectionalLight from "./DirectionalLight/index";
import PrimitiveLayer from "./GeojsonPrimitive/index";

const gui = new dat.GUI({
  name: "Cesium GUI",
  width: 450,
  autoPlace: true,
  closed: false,
});
gui.domElement.id = "gui";
gui.show();

let clock = new Clock(viewer);
clock.setTime("2023-07-01 08:00:00");

let directionalLight = new DirectionalLight(viewer, gui);

// let tileset = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: "./static/building/tileset.json",
//   })
// );
// tileset.style = new Cesium.Cesium3DTileStyle({
//   color: {
//     conditions: [
//       ["${height} >= 300", "rgba(0, 149, 251, 0.3)"],
//       ["${height} >= 200", "rgb(0, 149, 251, 0.3)"],
//       ["${height} >= 100", "rgb(0, 149, 251, 0.3)"],
//       ["${height} >= 50", "rgb(0, 149, 251, 0.3)"],
//       ["${height} >= 25", "rgb(0, 149, 251, 0.3)"],
//       ["${height} >= 10", "rgb(0, 149, 251, 0.3)"],
//       ["${height} >= 5", "rgb(0, 149, 251, 0.3)"],
//       ["true", "rgb(0, 149, 251, 0.3)"],
//     ],
//   },
// });

// let box = viewer.entities.add({
//   name: "Blue box",
//   position: Cesium.Cartesian3.fromDegrees(104.060783, 30.626141, 0),
//   box: {
//     heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//     dimensions: new Cesium.Cartesian3(100.0, 100.0, 250),
//     material: Cesium.Color.BLUE,
//   },
// });

// let subscriber = new Subscriber(viewer, {
//   element: viewer.canvas,
//   pickResult: {
//     enable: true,
//     moveDebounce: 0,
//   },
// });

// let eId: string = "";

// let subscriber_obj = {
//   add: () => {
//     subscriber.add(
//       box,
//       (move: any, result: any) => {
//         console.log("result", result);
//       },
//       "LEFT_CLICK"
//     );
//   },
//   remove: () => {
//     subscriber.remove(box, "LEFT_CLICK");
//   },
//   addExternal: () => {
//     if (!eId) {
//       eId = subscriber.addExternal((move: any, result: any) => {
//         if (result) {
//           viewer.canvas.style.cursor = "pointer";
//         } else {
//           viewer.canvas.style.cursor = "default";
//         }
//       }, "MOUSE_MOVE");
//     }
//   },
//   removeExternal: () => {
//     if (eId) {
//       subscriber.removeExternal(eId);
//       eId = "";
//       viewer.canvas.style.cursor = "default";
//     }
//   },
//   destroy: () => {
//     subscriber.destroy();
//   },
// };

// let subscriber_folder = gui.addFolder("Subscriber");
// subscriber_folder.add(subscriber_obj, "add").name("add订阅事件");
// subscriber_folder.add(subscriber_obj, "remove").name("remove销毁事件");
// subscriber_folder
//   .add(subscriber_obj, "addExternal")
//   .name("addExternal订阅事件");
// subscriber_folder
//   .add(subscriber_obj, "removeExternal")
//   .name("removeExternal销毁事件");
// subscriber_folder.add(subscriber_obj, "destroy").name("destroy销毁事件");

// const mouseTooltip = new MouseTooltip(viewer);
// mouseTooltip.content = "这是一个跟随鼠标的tooltip!";
// mouseTooltip.hide();

// let tooltip_obj = {
//   show: () => {
//     mouseTooltip.show();
//   },
//   hide: () => {
//     mouseTooltip.hide();
//   },
//   destroy: () => {
//     mouseTooltip.destroy();
//   },
// };

// let tooltip_folder = gui.addFolder("Tooltip");
// tooltip_folder.add(tooltip_obj, "show").name("显示");
// tooltip_folder.add(tooltip_obj, "hide").name("隐藏");
// tooltip_folder.add(tooltip_obj, "destroy").name("销毁");

// let draw = new Draw(viewer, {
//   tips: {
//     init: "点击绘制",
//     start: "左键添加点，右键移除点，双击结束绘制",
//   },
// });

// const setDraw = (type: StartOption["type"]) => {
//   draw?.start({
//     type: type,
//     onEnd: (entity, positions) => {
//       // console.log(
//       //   entity,
//       //   positions.map((pos) => CartesiantoLonlat(pos, viewer))
//       // );
//     },
//   });
// };

// const setClear = () => {
//   draw.reset();
// };

// let draw_obj = {
//   setPOINT: () => {
//     setDraw("POINT");
//   },
//   setPOLYLINE: () => {
//     setDraw("POLYLINE");
//   },
//   setPOLYGON: () => {
//     setDraw("POLYGON");
//   },
//   setCIRCLE: () => {
//     setDraw("CIRCLE");
//   },
//   setRECTANGLE: () => {
//     setDraw("RECTANGLE");
//   },
//   setCLEAR: () => {
//     setClear();
//   },
// };

// let draw_folder = gui.addFolder("Draw");
// draw_folder.add(draw_obj, "setPOINT").name("点");
// draw_folder.add(draw_obj, "setPOLYLINE").name("线");
// draw_folder.add(draw_obj, "setPOLYGON").name("多边形");
// draw_folder.add(draw_obj, "setCIRCLE").name("圆形");
// draw_folder.add(draw_obj, "setRECTANGLE").name("矩形");
// draw_folder.add(draw_obj, "setCLEAR").name("清除");

// let measure: any = {
//   current: null,
// };

// let activeTool: any = null;

// const setMeasureTool = (
//   name: string | null,
//   Tool: typeof Measure | null = null
// ) => {
//   if (measure.current) {
//     measure.current.destroy();
//     measure.current = undefined;
//   }

//   const newToolName = activeTool === name ? null : name;
//   activeTool = newToolName;

//   if (newToolName && Tool) {
//     measure.current = new Tool(viewer, {
//       units: "kilometers",
//       locale: {
//         start: "起点",
//         area: "面积",
//         total: "总计",
//         formatLength: (length, unitedLength) => {
//           if (length < 1000) {
//             return length + "米";
//           }
//           return unitedLength + "千米";
//         },
//         formatArea: (area, unitedArea) => {
//           if (area < 1000000) {
//             return area + "平方米";
//           }
//           return unitedArea + "平方千米";
//         },
//       },
//       drawerOptions: {
//         tips: {
//           init: "点击绘制",
//           start: "左键添加点，右键移除点，双击结束绘制",
//         },
//       },
//     });
//     measure.current.start();
//   }
// };

// const setMeasureClear = () => {
//   measure.current?.end();
// };

let camera = new Camera(viewer, gui, {
  position: {
    longitude: 114.003352,
    latitude: 22.489322,
    height: 1379713,
  },
  // degrees
  headingPitchRoll: {
    heading: 0,
    pitch: -90,
    roll: 0,
  },
});

const primitiveObj = new PrimitiveLayer({
  name: "广东省行政区",
  options: {
    fill: Cesium.Color.BLUE.withAlpha(0.6),
  },
});

let primitiveLayer: PrimitiveLayer | null = null;
(async () => {
  primitiveLayer = await primitiveObj.load(
    "./static/geojson/city/guangdong.json"
  );
  viewer.scene.primitives.add(primitiveLayer.primitiveCollection);
  viewer.scene.primitives.lowerToBottom(primitiveLayer.primitiveCollection);

  let PrimitiveLayer_obj = {
    show: true,
    name: () => {
      console.log(primitiveLayer.name);
    },
    collection: () => {
      console.log(
        "billboardCollection",
        primitiveLayer.billboardCollection.length
      );
      console.log("labelCollection", primitiveLayer.labelCollection.length);
      console.log(
        "pointPrimitiveCollection",
        primitiveLayer.pointPrimitiveCollection.length
      );
      console.log(
        "primitiveCollection",
        primitiveLayer.primitiveCollection.length
      );
    },
    primitive: () => {
      console.log("polygonPrimitive", primitiveLayer.polygonPrimitive);
      console.log("circlePrimitive", primitiveLayer.circlePrimitive);
      console.log("polylinePrimitive", primitiveLayer.polylinePrimitive);
    },
    event: () => {
      console.log("changedEvent", primitiveLayer.changedEvent);
      console.log("errorEvent", primitiveLayer.errorEvent);
      console.log("loadingEvent", primitiveLayer.loadingEvent);
    },
    more: () => {
      console.log("loading", primitiveLayer.loading);
      console.log("credit", primitiveLayer.credit);
      console.log("isDestroyed", primitiveLayer.isDestroyed);
      console.log("crsNames", primitiveLayer.crsNames);
      console.log("crsLinkHrefs", primitiveLayer.crsLinkHrefs);
      console.log("crsLinkTypes", primitiveLayer.crsLinkTypes);
      console.log("geojson", primitiveLayer.geojson);
      console.log("pinBuilder", primitiveLayer.pinBuilder);
      console.log("show", primitiveLayer.show);
      console.log("featureItems", primitiveLayer.featureItems);
      console.log("name", primitiveLayer.name);
    },
  };

  let PrimitiveLayer_folder = gui.addFolder("PrimitiveLayer");
  PrimitiveLayer_folder.open();
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "show")
    .name("显示")
    .onChange((v) => {
      primitiveLayer.show = v;
    });
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "name").name("name");
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "collection").name(
    "获取collection"
  );
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "primitive").name(
    "获取primitive"
  );
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "event").name("获取event");
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "more").name("获取more");
})();
