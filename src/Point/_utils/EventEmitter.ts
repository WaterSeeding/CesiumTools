type EventEmitterCallbacks = {
  [propName: string]: any[];
};

interface EventEmitterInterface {
  callbacks: EventEmitterCallbacks;
  on(_names: string, callback: (data?: any) => void): any;
  off(_names: string): any;
  trigger(_name: string, message: any): any;
}

class EventEmitter implements EventEmitterInterface {
  callbacks: EventEmitterCallbacks;

  constructor() {
    this.callbacks = {};
  }

  public on(_names: string, cb: (data?: any) => void): any {
    if (!this.callbacks[_names]) {
      this.callbacks[_names] = [];
    }
    this.callbacks[_names].push(cb);
  }

  public off(_names: string, cb?: (data?: any) => void): any {
    if (this.callbacks[_names]) {
      this.callbacks[_names] = [];
      cb?.();
    } else {
      console.warn('无订阅事件');
    }
  }

  public trigger(_name: string, message: any): any {
    if (this.callbacks.hasOwnProperty(_name)) {
      this.callbacks[_name].forEach((value, index) => {
        this.callbacks[_name][index](message);
      });
    }
  }
}

export default EventEmitter;
