import * as Cesium from "cesium";
import EventEmitter from './_utils/EventEmitter';

export interface PointInterface {
  viewer: Cesium.Viewer;
}

const  ByDirectionAndLen = (
  position: Cesium.Cartesian3,
  angle: number,
  len: number,
) => {
  // 从具有东北向上轴的参考帧计算4x4变换矩阵以提供的原点为中心，以提供的椭球的固定参考系为中心。
  let matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  // 创建围绕z轴的旋转矩阵
  let mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle || 0));
  // 从Matrix3计算代表旋转的Matrix4实例和代表翻译的Cartesian3
  let rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
  // 计算两个矩阵(matrix * rotationZ)的乘积
  Cesium.Matrix4.multiply(matrix, rotationZ, matrix);
  let result = Cesium.Matrix4.multiplyByPoint(
    matrix,
    new Cesium.Cartesian3(0, -20, len),
    new Cesium.Cartesian3(),
  );
  return result;
};

class Point extends EventEmitter implements PointInterface {
  viewer: Cesium.Viewer;
  constructor(viewer: Cesium.Viewer) {
    super();
    this.viewer = viewer;
  }

  createPointIcon(cartesian: Cesium.Cartesian3) {
    this.viewer.entities.add({
      position: cartesian,
      point: {
        show: true, // default
        color: Cesium.Color.SKYBLUE, // default: WHITE
        pixelSize: 10, // default: 1
        outlineColor: Cesium.Color.YELLOW, // default: BLACK
        outlineWidth: 3, // default: 0
      },
    });
  }

  getPointInfo() {
    const handler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas,
    );
    handler?.setInputAction((movement: any) => {
      // 定义一个屏幕点击的事件，pickPosition封装的是获取点击的位置的坐标
      // 输出之后我们发现如前言所说的坐标都是笛卡尔坐标，所以我们需要转换笛卡尔坐标
      let position = this.viewer.scene.pickPosition(movement.position);
      if (!position || !(position instanceof Cesium.Cartesian3)) {
        return false;
      }
      // 将笛卡尔坐标转化为弧度坐标
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      // 将弧度坐标转换为经纬度坐标
      let longitudeWorld = Cesium.Math.toDegrees(cartographic.longitude); // 经度
      let latitudeWorld = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
      let heightWorld = cartographic.height; //高度
      console.warn('经度: ', longitudeWorld);
      console.warn('纬度: ' + latitudeWorld);
      console.warn('高度: ' + heightWorld);
      // 同时也可以将经度度转回为笛卡尔
      let ellipsoid = this.viewer.scene.globe.ellipsoid;
      // 定义84坐标为一个Cartesian值
      let wgs84 = Cesium.Cartographic.fromDegrees(
        longitudeWorld,
        latitudeWorld,
        heightWorld,
      );
      // 将84坐标转换为笛卡尔
      let dikaer = ellipsoid.cartographicToCartesian(wgs84);
      // 赋值
      let longitudeDescartes = dikaer.x;
      let latitudeDescartes = dikaer.y;
      let heightDescartes = dikaer.z;
      console.warn('笛卡尔x: ', longitudeDescartes);
      console.warn('笛卡尔y: ', latitudeDescartes);
      console.warn('笛卡尔z: ', heightDescartes);
      this.createPointIcon(dikaer);

      handler.destroy();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  flytoPointIcon(viewer: Cesium.Viewer, targetEntity: any, cb?: Function) {
    let center = targetEntity?.position?._value?.clone?.();
    const boundingSphere = new Cesium.BoundingSphere(center, 30);
    const newBoundingSphere = Cesium.BoundingSphere.clone(boundingSphere);
    newBoundingSphere.center = ByDirectionAndLen(
      newBoundingSphere.center,
      0,
      50,
    );
    viewer.camera.flyToBoundingSphere(newBoundingSphere, {
      duration: 1.5,
      offset: new Cesium.HeadingPitchRange(
        1.0804027924653639,
        -0.3823011247889818,
        400,
      ),
      complete: () => {
        cb?.();
      },
      cancel: () => {},
    });
  }

  flyBackOrigin() {
    this.trigger('flyFromPoint', []);
  }
}

export default Point;
