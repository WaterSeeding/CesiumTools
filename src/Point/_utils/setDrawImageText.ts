import * as Cesium from "cesium";

const loadImg = (url: string) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = () => reject(null);
  });
};

const drawCtx = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  count: string,
  dxOffset: number = 0,
  dyOffset: number = 50,
) => {
  const context = canvas.getContext('2d');
  context!.drawImage(
    image as CanvasImageSource,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  const textCanvas = Cesium.writeTextToCanvas(count, {
    font: `bold ${72}px sans-serif`,
    fillColor: Cesium.Color.WHITE,
  });
  let dx = (canvas.width - textCanvas!.width) / 2 - dxOffset;
  let dy = (canvas.height - textCanvas!.height) / 2 - dyOffset;
  context!.drawImage(textCanvas!, dx, dy);
};

const setDrawImageText = async (url: string, text: string, isQiye?: boolean) => {
  const canvas = document.createElement('canvas');
  const image = (await loadImg(url)) as HTMLImageElement;
  canvas.width = image.width;
  canvas.height = image.height;

  const clonedcanvas = canvas.cloneNode(true) as HTMLCanvasElement;
  if (isQiye) {
    drawCtx(clonedcanvas, image as HTMLImageElement, text, 0, 60);
  } else {
    drawCtx(clonedcanvas, image as HTMLImageElement, text);
  }
  const dataUrl = clonedcanvas.toDataURL();

  return dataUrl;
};

export default setDrawImageText;
