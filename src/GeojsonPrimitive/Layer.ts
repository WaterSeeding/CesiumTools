import * as Cesium from "cesium";
import Subscriber, {
  EventType,
  ExternalListenCallback,
} from "../Subscriber/index";

class Layer {
  protected _changed: Cesium.Event;
  private _subscriber: Subscriber | undefined;
  protected _subscribIds: string[] = [];

  constructor(options: { subscriber?: Subscriber }) {
    this._subscriber = options.subscriber;
    this._changed = new Cesium.Event();
  }

  addSubscribers(callback: ExternalListenCallback, eventType: EventType) {
    if (!this._subscriber) return;
    const id = this._subscriber.addExternal(callback, eventType);
    if (id) this._subscribIds.push(id);
  }

  removeSubscribers(ids?: string | string[]) {
    this._subscriber?.removeExternal(ids ?? this._subscribIds);
  }
}

export default Layer;
