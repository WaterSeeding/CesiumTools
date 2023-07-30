import "./app.css";
import * as Cesium from "cesium";
import * as dat from "dat.gui";
import { viewer } from "./main";
import Clock from "./Clock/index";
import Camera from "./Camera/index";
import DirectionalLight from "./DirectionalLight/index";
import PrimitiveLayer from "./GeojsonPrimitiveLayer/index";

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

let camera = new Camera(viewer, gui, {
  position: {
    longitude: 113.979829,
    latitude: 22.603616,
    height: 77553,
  },
  // degrees
  headingPitchRoll: {
    heading: 0,
    pitch: -90,
    roll: 0,
  },
});

const primitiveObj = new PrimitiveLayer({
  name: "深圳市",
  options: {
    fill: Cesium.Color.BLUE.withAlpha(0.6),
  },
});

primitiveObj.changedEvent.addEventListener(() => {
  console.log("[changedEvent]订阅");
});
primitiveObj.errorEvent.addEventListener(() => {
  console.log("[errorEvent]订阅");
});
primitiveObj.loadingEvent.addEventListener(() => {
  console.log("[loadingEvent]订阅");
});

let primitiveLayer: PrimitiveLayer | null = null;
(async () => {
  primitiveLayer = await primitiveObj.load(
    "./static/geojson/city/shenzhen.json",
    // "./static/geojson/city/shenzhenPoint.json",
    // "./static/geojson/city/shenzhenLine.json",
    // "./static/geojson/city/shenzhenRing.json",
    {
      fill: Cesium.Color.RED.withAlpha(0.8),
      markerSymbol: "hospital",
      markerColor: Cesium.Color.BLUE,
      markerSize: 10,
      stroke: Cesium.Color.GREEN,
      strokeWidth: 5,
      credit: new Cesium.Credit(
        '<a href="https://cesiumjs.org/" target="_blank"><img src="./static/img/icon.png" title="Cesium"/></a>'
      ),
    }
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
    collectionContent: {
      billboardCollection: true,
      labelCollection: true,
      pointPrimitiveCollection: true,
      primitiveCollection: true,
    },
    primitive: () => {
      console.log("polygonPrimitive", primitiveLayer.polygonPrimitive);
      console.log("circlePrimitive", primitiveLayer.circlePrimitive);
      console.log("polylinePrimitive", primitiveLayer.polylinePrimitive);
    },
    primitiveContent: {
      polygonPrimitive: true,
      circlePrimitive: true,
      polylinePrimitive: true,
    },
    removeAllPrimitive: () => {
      primitiveLayer.removeAllPrimitive();
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

  if (primitiveLayer.billboardCollection.length > 0) {
    PrimitiveLayer_folder.add(
      PrimitiveLayer_obj.collectionContent,
      "billboardCollection"
    ).onChange((v) => {
      primitiveLayer.billboardCollection.show = v;
    });
  }

  if (primitiveLayer.labelCollection.length > 0) {
    PrimitiveLayer_folder.add(
      PrimitiveLayer_obj.collectionContent,
      "labelCollection"
    ).onChange((v) => {
      primitiveLayer.labelCollection.show = v;
    });
  }

  if (primitiveLayer.pointPrimitiveCollection.length > 0) {
    PrimitiveLayer_folder.add(
      PrimitiveLayer_obj.collectionContent,
      "pointPrimitiveCollection"
    ).onChange((v) => {
      primitiveLayer.pointPrimitiveCollection.show = v;
    });
  }

  if (primitiveLayer.primitiveCollection.length > 0) {
    PrimitiveLayer_folder.add(
      PrimitiveLayer_obj.collectionContent,
      "primitiveCollection"
    ).onChange((v) => {
      primitiveLayer.primitiveCollection.show = v;
    });
  }

  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "primitive").name(
    "获取primitive"
  );
  if (primitiveLayer.polygonPrimitive) {
    PrimitiveLayer_folder.add(
      PrimitiveLayer_obj.primitiveContent,
      "polygonPrimitive"
    ).onChange((v) => {
      primitiveLayer.polygonPrimitive.show = v;
    });
  }
  if (primitiveLayer.circlePrimitive) {
    PrimitiveLayer_folder.add(
      PrimitiveLayer_obj.primitiveContent,
      "circlePrimitive"
    ).onChange((v) => {
      primitiveLayer.circlePrimitive.show = v;
    });
  }
  if (primitiveLayer.polylinePrimitive) {
    PrimitiveLayer_folder.add(
      PrimitiveLayer_obj.primitiveContent,
      "polylinePrimitive"
    ).onChange((v) => {
      primitiveLayer.polylinePrimitive.show = v;
    });
  }
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "removeAllPrimitive").name(
    "removeAllPrimitive"
  );
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "event").name("获取event");
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "more").name("获取more");
  PrimitiveLayer_folder.add(PrimitiveLayer_obj, "more").name("获取more");
})();
