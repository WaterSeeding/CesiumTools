import * as Cesium from "cesium";
import { nanoid } from "nanoid";

export interface EventArgs {
  position?: Cesium.Cartesian2;
  endPosition?: Cesium.Cartesian2;
  startPosition?: Cesium.Cartesian2;
  [name: string]: any;
}

export type ListenCallback<T> = (movement: EventArgs, substance: T) => void;

export type ExternalListenCallback = (movement: EventArgs, result: any) => void;

export type EventType =
  | "LEFT_DOWN"
  | "LEFT_UP"
  | "LEFT_CLICK"
  | "LEFT_DOUBLE_CLICK"
  | "RIGHT_DOWN"
  | "RIGHT_UP"
  | "RIGHT_CLICK"
  | "MIDDLE_DOWN"
  | "MIDDLE_UP"
  | "MIDDLE_CLICK"
  | "MOUSE_MOVE"
  | "WHEEL"
  | "PINCH_START"
  | "PINCH_MOVE"
  | "PINCH_END";

// Map是一组键值对的结构，具有极快的查找速度。
type EventCollection = Record<
  EventType,
  Map<string, ListenCallback<Cesium.Entity>>
>;

type ExternalEventCollection = Record<
  EventType,
  Map<string, ListenCallback<Cesium.Entity>>
>;

class Subscriber {
  private _viewer: Cesium.Viewer;
  private _handler: Cesium.ScreenSpaceEventHandler;
  private _eventCollection: EventCollection = Object.create(null);
  private _externalEventCollection: ExternalEventCollection = Object.create({});

  private readonly _eventTypeList: EventType[] = [
    "LEFT_DOWN",
    "LEFT_UP",
    "LEFT_CLICK",
    "LEFT_DOUBLE_CLICK",
    "RIGHT_DOWN",
    "RIGHT_UP",
    "RIGHT_CLICK",
    "MIDDLE_DOWN",
    "MIDDLE_UP",
    "MIDDLE_CLICK",
    "MOUSE_MOVE",
    "WHEEL",
    "PINCH_START",
    "PINCH_MOVE",
    "PINCH_END",
  ];

  private _moveDebounce: number | undefined;
  private _lastTime: number;
  private _enablePickResult: boolean;
  private _lastResult: any;

  private _isDestroy: boolean;

  constructor(
    viewer: Cesium.Viewer,
    options: {
      element?: HTMLCanvasElement;
      pickResult?: {
        enable: boolean;
        moveDebounce?: number;
      };
    } = {}
  ) {
    this._viewer = viewer;
    this._handler = new Cesium.ScreenSpaceEventHandler(
      options.element || this._viewer.canvas
    );
    this._moveDebounce = options.pickResult?.moveDebounce;
    this._enablePickResult = options.pickResult?.enable ?? false;
    this._lastTime = new Date().getTime();
    this._isDestroy = false;
    this._initListener();
  }

  /**
   * 确定是否销毁
   */
  get isDestroy() {
    return this._isDestroy;
  }

  private _initListener(): void {
    this._eventTypeList.forEach((type) => {
      this._eventCollection[type] = new Map();
      this._externalEventCollection[type] = new Map();
    });
  }

  private _shouldUpdate(update = true) {
    if (!this._moveDebounce) return true;

    const timeNow = new Date().getTime();
    if (timeNow - this._lastTime < this._moveDebounce) {
      return false;
    } else {
      if (update) this._lastTime = timeNow;
      return true;
    }
  }

  private _eventRegister(eventType: EventType): void {
    if (this._isDestroy) return;
    const eventCollection = this._eventCollection[eventType];
    const externalEventCollection = this._externalEventCollection[eventType];
    this._handler.setInputAction((movement: EventArgs) => {
      if (
        this._isDestroy ||
        (eventType === "MOUSE_MOVE" && !this._shouldUpdate())
      ) {
        return;
      }

      if (this._enablePickResult) {
        if (eventType === "MOUSE_MOVE" && movement.endPosition) {
          this._lastResult = this._viewer.scene.pick(movement.endPosition);
        } else if (movement.position) {
          this._lastResult = this._viewer.scene.pick(movement.position);
        }
      }

      if (externalEventCollection.size > 0) {
        const iterator = externalEventCollection.values();
        let val = iterator.next();
        while (!val.done) {
          val.value(movement, this._lastResult);
          val = iterator.next();
        }
      }

      if (movement.position || movement.endPosition) {
        const entity: Cesium.Entity | undefined = this._lastResult?.id;
        if (
          entity &&
          eventCollection.has(entity.id) &&
          typeof eventCollection.get(entity.id) === "function"
        ) {
          const func = eventCollection.get(entity.id);
          if (func) func(movement, entity);
        }
      }
    }, Cesium.ScreenSpaceEventType[eventType]);
  }

  /**
   * @description 为Entity添加监听事件
   *
   * @event
   *
   * @param {Function} callback 需要相应的事件
   *
   * @param {EventType} eventType 事件类型
   */
  add(
    substances: Cesium.Entity | Cesium.Entity[],
    callback: ListenCallback<Cesium.Entity>,
    eventType: EventType
  ): void {
    if (this._isDestroy) return;

    if (
      this._eventCollection[eventType].size === 0 &&
      this._externalEventCollection[eventType].size === 0
    ) {
      this._eventRegister(eventType);
    }

    const substancesArray = Array.isArray(substances)
      ? substances
      : [substances];

    for (const substance of substancesArray) {
      this._eventCollection[eventType].set(substance.id, callback);
    }
  }

  /**
   * @description 添加特定事件，与add不同在于该事件不会过滤Entity
   * @param callback 事件处理函数
   * @param eventType 事件类型
   * @return {string} Event Id  事件移除时需要提供事件ID
   */
  addExternal(callback: ExternalListenCallback, eventType: EventType): string {
    if (this._isDestroy) return "";

    if (
      this._eventCollection[eventType].size === 0 &&
      this._externalEventCollection[eventType].size === 0
    ) {
      this._eventRegister(eventType);
    }

    const eId = nanoid();
    this._externalEventCollection[eventType].set(eId, callback);
    return eId;
  }

  /**
   *@description 移除指定Substance的相应事件
   * @param substances 需要移除事件的Substance
   * @param eventType 需要移除的时间类型
   */
  remove<T extends Cesium.Entity>(
    substances: T | T[],
    eventType: EventType
  ): void {
    if (this._isDestroy) return;

    const substancesArray = Array.isArray(substances)
      ? substances
      : [substances];
    for (const substance of substancesArray) {
      if (this._eventCollection[eventType].has(substance.id)) {
        this._eventCollection[eventType].delete(substance.id);
      }
    }
  }

  removeExternal(ids: string | string[], eventType?: EventType): void {
    if (this._isDestroy) return;

    const idsArray = Array.isArray(ids) ? ids : [ids];

    for (const id of idsArray) {
      const type = eventType || this._searchExternal(id);
      if (type && this._externalEventCollection[type]?.has(id)) {
        this._externalEventCollection[type].delete(id);
      }
    }
  }

  private _searchExternal(id: string): EventType | undefined {
    if (this._isDestroy) return;

    const types: EventType[] = Object.keys(
      this._externalEventCollection
    ) as any;

    for (const type of types) {
      const events = this._externalEventCollection[type];
      if (events.has(id)) return type;
    }
    return;
  }

  removeNative(viewer: Cesium.Viewer, eventType: EventType): void {
    viewer.screenSpaceEventHandler.removeInputAction(
      this.convertCesiumEventType(eventType)
    );
  }

  private convertCesiumEventType(
    subscriberEventType: EventType
  ): Cesium.ScreenSpaceEventType {
    return Cesium.ScreenSpaceEventType[subscriberEventType];
  }

  destroy(): void {
    this._isDestroy = true;
    this._handler.destroy();
  }
}

export default Subscriber;
