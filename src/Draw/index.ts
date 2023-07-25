import * as Cesium from "cesium";
import MouseTooltip from "../Tooltip/MouseTooltip";

import Subscriber, { EventArgs, EventType } from "../Subscriber/index";
import Painter from "./painter";

import Point from "./shape/point";
import Line from "./shape/line";
import Polygon from "./shape/polygon";
import Circle from "./shape/circle";
import Rectangle from "./shape/rectangle";

import type { BasicGraphicesOptions } from "./base";
import type {
  ActionCallback,
  DrawOption,
  OperationType,
  OverrideEntityFunc,
  StartOption,
  Status,
} from "./typings";

export * from "./typings";

export const defaultOptions: DrawOption = {
  terrain: false,
  operateType: {
    START: "LEFT_CLICK",
    MOVING: "MOUSE_MOVE",
    CANCEL: "RIGHT_CLICK",
    END: "LEFT_DOUBLE_CLICK",
  },

  /**
   * 图形勾画时的Entity样式
   */
  dynamicGraphicsOptions: {
    POLYLINE: {
      clampToGround: true,
      width: 2,
      material: Cesium.Color.YELLOW,
    },
    POLYGON: {
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 2,
      material: Cesium.Color.DARKTURQUOISE.withAlpha(0.5),
    },
    POINT: {
      color: Cesium.Color.BLUE,
      pixelSize: 8,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    },
    RECTANGLE: {
      material: Cesium.Color.YELLOW.withAlpha(0.5),
    },
    CIRCLE: {
      material: Cesium.Color.YELLOW.withAlpha(0.5),
      outline: true,
    },
  },
  sameStyle: true,
  tips: {
    init: "Click to draw",
    start:
      "LeftClick to add a point, rightClick remove point, doubleClick end drawing",
    end: "",
  },
};

class Draw {
  private _viewer: Cesium.Viewer;
  private _type!: StartOption["type"];
  private _terrain: boolean;
  private _subscriber: Subscriber;

  private _status: Status;

  private _painter!: Painter;

  private _events: string[] = [];

  private _typeClass!: Line | Polygon | Point | Rectangle | Circle;

  private _option: DrawOption;

  private $Instance!: Cesium.Entity | any;
  private $AddedInstance: Cesium.Entity[] = [];

  private _dropPoint!: (move: EventArgs) => void;
  private _moving!: (move: EventArgs) => void;
  private _cancel!: (move: EventArgs) => void;
  private _playOff!: (move: EventArgs) => Cesium.Entity;

  /**
   * @desc 操作方式
   */
  private _operateType: {
    START: EventType;
    MOVING: EventType;
    CANCEL: EventType;
    END: EventType;
  };

  private _oneInstance!: boolean;

  private _once!: boolean;

  /**
   * @desc 动作回调
   */
  private _action: ActionCallback | undefined;

  private _sameStyle!: boolean;
  mouseTooltip: MouseTooltip;
  private _tips: Required<DrawOption["tips"]>;

  get status(): Status {
    return this._status;
  }

  get operateType() {
    return this._operateType;
  }

  get isDestroyed(): boolean {
    return this._status === "DESTROY";
  }

  // Partial 可以快速把某个接口类型中定义的所有属性变成可选的。
  constructor(viewer: Cesium.Viewer, options?: Partial<DrawOption>) {
    this._option = Cesium.defaultValue(options, {});

    if (!viewer) throw new Error("请输入Viewer对象！");

    // 设置操作方式
    this._operateType = {
      ...defaultOptions.operateType,
      ...options?.operateType,
    } as Required<OperationType>;

    this._viewer = viewer;
    this._terrain = Cesium.defaultValue(
      this._option.terrain,
      defaultOptions.terrain
    );

    this._action = this._option.action;

    this._tips = {
      ...defaultOptions.tips,
      ...options?.tips,
    } as Required<DrawOption["tips"]>;

    if (this._terrain && !this._viewer.scene.pickPositionSupported) {
      console.warn(
        "浏览器不支持 pickPosition属性，无法在有地形的情况下正确选点"
      );
      this._terrain = false;
    }

    this._subscriber = new Subscriber(this._viewer);

    this.mouseTooltip = new MouseTooltip(viewer);
    this.mouseTooltip.enabled = false;

    this._status = "INIT";
  }

  /**
   * @param finalOptions
   * @param dynamicOptions
   */
  private _initPainter(options: BasicGraphicesOptions): void {
    const painterOptions = { viewer: this._viewer, terrain: this._terrain };

    this._painter = new Painter(painterOptions);

    if (this._type === "POLYGON") {
      this._typeClass = new Polygon(this._painter, options);
    } else if (this._type === "POLYLINE") {
      this._typeClass = new Line(this._painter, options);
    } else if (this._type === "POINT") {
      this._typeClass = new Point(this._painter, options);
    } else if (this._type === "CIRCLE") {
      this._typeClass = new Circle(this._painter, options);
    } else if (this._type === "RECTANGLE") {
      this._typeClass = new Rectangle(this._painter, options);
    }

    this._dropPoint = this._typeClass.dropPoint.bind(this._typeClass);
    this._moving = this._typeClass.moving.bind(this._typeClass);
    this._cancel = this._typeClass.cancel.bind(this._typeClass);
    this._playOff = this._typeClass.playOff.bind(this._typeClass);
  }

  private _updateTips() {
    if (!this._painter) return;
    if (this._status === "INIT" || this._status === "DESTROY") {
      this.mouseTooltip.enabled = false;
      return;
    }
    if (this._status === "PAUSE") {
      this.mouseTooltip.content = this._tips.end;
      if (this._once === true) this.mouseTooltip.enabled = false;
      return;
    }
    if (this._painter._breakPointEntities.length === 0) {
      this.mouseTooltip.content = this._tips.init;
    } else {
      this.mouseTooltip.content = this._tips.start;
    }
  }

  /**
   * @desc 绘制函数,
   * @param config 绘制配置，可以通过定义options直接改写结果而不再填第二个参数
   * @param overrideFunc Entity 重写函数，用于重写绘制结果，如果 overrideFunc返回一个Entity,则将该Entity添加到Viewer中，否则结束函数无操作
   * @returns
   */
  start(
    config: StartOption,
    overrideFunc: OverrideEntityFunc = (
      action: EventType,
      entity: Cesium.Entity
    ) => entity
  ): void {
    // eslint-disable-next-line no-param-reassign
    config = Cesium.defaultValue(config, {});
    this._once = Cesium.defaultValue(config.once, true);
    this._oneInstance = Cesium.defaultValue(config.oneInstance, false);

    if (!this._isSupport(config.type)) {
      throw new Error(`the type '${config.type}' is not support`);
    }

    this._type = config.type;
    const defaultOpts = defaultOptions.dynamicGraphicsOptions[this._type];

    this._initPainter({
      finalOptions: {
        ...defaultOpts,
        ...config.finalOptions,
      },
      dynamicOptions: {
        ...defaultOpts,
        ...config.dynamicOptions,
      },
      sameStyle: this._sameStyle,
      onEnd: config.onEnd,
      onPointsChange: config.onPointsChange,
    });

    if (this._status === "START") return;

    this._status = "START";
    this._viewer.canvas.style.cursor = "crosshair";
    this._updateTips();

    /**
     * @desc 是否开始绘制
     */
    let isStartDraw = false;

    // 开始事件
    const startId = this._subscriber.addExternal((move) => {
      if (this._oneInstance && this.$Instance) {
        this._viewer.entities.remove(this.$Instance);
        this.$AddedInstance = [];
      }

      this._dropPoint(move);
      if (this._action) this._action(this._operateType.START, move);

      // 如果是点，则此时执行点的结束绘制操作
      if (this._type === "POINT") {
        this._complete(overrideFunc);
        isStartDraw = false;
        const positions = this.$Instance?.position?.getValue(
          new Cesium.JulianDate()
        );
        if (config.onEnd && this.$Instance && positions)
          config.onEnd(this.$Instance, [positions]);
      }

      this._updateTips();
      // 100ms后才能继续,避免热键冲突
      setTimeout(() => {
        isStartDraw = true;
      }, 100);
    }, this._operateType.START);

    // 移动事件
    const moveId = this._subscriber.addExternal((move) => {
      this._viewer.canvas.style.cursor = "crosshair";
      if (!isStartDraw) return;

      this._moving(move);

      // ActionCallback
      if (this._action) this._action(this._operateType.MOVING, move);
    }, this._operateType.MOVING);

    // Redraw the shape so it's not dynamic and remove the dynamic shape.
    const cancelId = this._subscriber.addExternal((move) => {
      if (!isStartDraw) return;

      this._cancel(move);
      this._updateTips();

      // ActionCallback
      if (this._action) this._action(this._operateType.CANCEL, move);
    }, this._operateType.CANCEL);

    // Redraw the shape so it's not dynamic and remove the dynamic shape.
    const endId = this._subscriber.addExternal((move) => {
      if (!isStartDraw) return;

      // 结束绘制，确定实体
      this._playOff(move);

      // ActionCallback
      if (this._action) this._action(this._operateType.END, move);

      if (this._type === "POINT") return;

      this._complete(overrideFunc);
      this._updateTips();

      isStartDraw = false;
    }, this._operateType.END);

    this._events = [startId, moveId, cancelId, endId];
  }

  private _complete(override: OverrideEntityFunc): void {
    // 如果是线和面，则此时将实例添加到Viewer中
    if (this._once) this.pause();

    if (this._oneInstance && this.$Instance) {
      this._viewer.entities.remove(this.$Instance);
    }

    this.$Instance = override.call(
      this,
      this._operateType.END,
      this._typeClass.result
    );

    if (this.$Instance instanceof Cesium.Entity) {
      this._viewer.entities.add(this.$Instance);
      this.$AddedInstance.push(this.$Instance);
    }
    this._viewer.canvas.style.cursor = "default";
  }

  private _isSupport(type: string) {
    return ["POLYGON", "POLYLINE", "POINT", "CIRCLE", "RECTANGLE"].includes(
      type
    );
  }

  reset() {
    this.pause();
    this._status = "INIT";
    this._painter?.clear();
    this.$AddedInstance.map((entity) => {
      this._viewer.entities.remove(entity);
    });
    this.$AddedInstance = [];
    this._viewer.scene.requestRender();
  }

  pause(): void {
    this._status = "PAUSE";
    this._updateTips();
    this._subscriber.removeExternal(this._events);
    this._events = [];
    this._viewer.canvas.style.cursor = "default";
  }

  destroy(): void {
    this._status = "DESTROY";
    this.reset();
    this._subscriber.destroy();
  }
}

export default Draw;
