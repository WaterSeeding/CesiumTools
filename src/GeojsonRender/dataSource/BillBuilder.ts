import * as Cesium from "cesium";

const colorScratch = new Cesium.Color();
const stringifyScratch = new Array(4);

const drawArc = (
  context2D: CanvasRenderingContext2D,
  color: Cesium.Color,
  size: number
) => {
  context2D.save();
  context2D.scale(size / 24, size / 24);
  context2D.fillStyle = color.toCssColorString(); //Modified from auto-generated code.
  context2D.strokeStyle = color.brighten(0.6, colorScratch).toCssColorString(); //Modified from auto-generated code.
  context2D.arc(12, 12, 6, 0, Math.PI * 2, true);
  context2D.fill();
  context2D.lineWidth = 0.846;
  context2D.stroke();
  context2D.restore();
};

const createPin = (
  url: string | undefined,
  label: string,
  color: Cesium.Color,
  size: number,
  cache: Record<string, HTMLCanvasElement>
): HTMLCanvasElement => {
  //Use the parameters as a unique ID for caching.
  stringifyScratch[0] = url;
  stringifyScratch[1] = label;
  stringifyScratch[2] = color;
  stringifyScratch[3] = size;
  const id = JSON.stringify(stringifyScratch);

  const item = cache[id];
  if (Cesium.defined(item)) {
    return item;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context2D = canvas.getContext("2d");
  if (context2D) {
    drawArc(context2D, color, size);
    context2D.font = "16px sans-serif";
    context2D.lineJoin = "round";
    context2D.textAlign = "center";
    context2D.textBaseline = "middle";
    context2D.strokeStyle = "black";
    context2D.lineWidth = 3;
    context2D.strokeText(label, size / 2, size / 2);
    context2D.fillStyle = "white";
    context2D.fillText(label, size / 2, size / 2);
  }

  cache[id] = canvas;
  return canvas;
};

class BillBuilder {
  private _cache: Record<string, HTMLCanvasElement>;

  constructor() {
    this._cache = {};
  }

  fromText(text: string, color: Cesium.Color, size: number): HTMLCanvasElement {
    if (!Cesium.defined(text)) {
      throw new Cesium.DeveloperError("text is required");
    }
    if (!Cesium.defined(color)) {
      throw new Cesium.DeveloperError("color is required");
    }
    if (!Cesium.defined(size)) {
      throw new Cesium.DeveloperError("size is required");
    }

    return createPin(undefined, text, color, size, this._cache);
  }
}

export default BillBuilder;
