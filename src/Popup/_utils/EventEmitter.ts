type EventEmitterCallbacks = {
  base: {
    [propName: string]: Function[];
  };
  [propName: string]: {
    [propName: string]: Function[];
  };
};

interface EventEmitterInterface {
  callbacks: EventEmitterCallbacks;
  on(_names: string, callback: Function): any;
  off(_names: string): any;
  trigger(_name: string, _args: any[]): any;
  resolveNames(_names: string): string[];
  resolveName(name: string): FuncResolveNameReturnInterface;
}

interface FuncResolveNameReturnInterface {
  original: string;
  value: string;
  namespace: string;
}

class EventEmitter implements EventEmitterInterface {
  callbacks: EventEmitterCallbacks;

  /**
   * Constructor
   */
  constructor() {
    this.callbacks = {
      base: {},
    };
  }

  /**
   * On
   */
  public on(_names: string, callback: Function): any {
    const that = this;

    // Errors
    if (typeof _names === 'undefined' || _names === '') {
      console.warn('wrong names');
      return false;
    }

    if (typeof callback === 'undefined') {
      console.warn('wrong callback');
      return false;
    }

    const names = this.resolveNames(_names);
    names.forEach(function (_name: string) {
      const name = that.resolveName(_name);

      // 创建命名空间（如果不存在）
      if (!(that.callbacks[name.namespace] instanceof Object))
        that.callbacks[name.namespace] = {};

      // 创建回调函数（如果不存在）
      if (!(that.callbacks[name.namespace][name.value] instanceof Array))
        that.callbacks[name.namespace][name.value] = [];

      // 添加回调函数
      that.callbacks[name.namespace][name.value].push(callback);
    });

    return this;
  }

  /**
   * Off
   */
  public off(_names: string): any {
    const that = this;

    // Errors
    if (typeof _names === 'undefined' || _names === '') {
      console.warn('wrong name');
      return false;
    }

    const names = this.resolveNames(_names);
    names.forEach(function (_name: string) {
      const name = that.resolveName(_name);

      if (name.namespace !== 'base' && name.value === '') {
        delete that.callbacks[name.namespace]; // 删除命名空间
      } else {
        // 默认
        if (name.namespace === 'base') {
          // Try to remove from each namespace
          for (const namespace in that.callbacks) {
            if (
              that.callbacks[namespace] instanceof Object &&
              that.callbacks[namespace][name.value] instanceof Array
            ) {
              delete that.callbacks[namespace][name.value];

              if (Object.keys(that.callbacks[namespace]).length === 0)
                delete that.callbacks[namespace]; // 删除命名空间
            }
          }
        } else if (
          that.callbacks[name.namespace] instanceof Object &&
          that.callbacks[name.namespace][name.value] instanceof Array
        ) {
          delete that.callbacks[name.namespace][name.value];

          if (Object.keys(that.callbacks[name.namespace]).length === 0)
            delete that.callbacks[name.namespace]; // 删除命名空间
        }
      }
    });

    return this;
  }

  public trigger(_name: string, _args: any[]): any {
    // Errors
    if (typeof _name === 'undefined' || _name === '') {
      console.warn('wrong name');
      return false;
    }

    const that = this;
    let finalResult: any = null;
    let result = null;

    // Default args
    const args = !(_args instanceof Array) ? [] : _args;

    // 解析名称（注意空格、分号）
    let names = this.resolveNames(_name);

    // 解析名称
    let name = this.resolveName(names[0]);

    if (name.namespace === 'base') {
      // 默认命名空间
      for (const namespace in that.callbacks) {
        if (
          that.callbacks[namespace] instanceof Object &&
          that.callbacks[namespace][name.value] instanceof Array
        ) {
          that.callbacks[namespace][name.value].forEach(function (
            callback: Function,
          ) {
            // apply() 方法调用一个具有给定 this 值的函数，以及以一个数组（或一个类数组对象）的形式提供的参数。
            result = callback.apply(that, args);

            if (typeof finalResult === 'undefined') {
              finalResult = result;
            }
          });
        }
      }
    } else if (this.callbacks[name.namespace] instanceof Object) {
      // 指定命名空间
      if (name.value === '') {
        console.warn('wrong name');
        return this;
      }

      that.callbacks[name.namespace][name.value].forEach(function (
        callback: Function,
      ) {
        result = callback.apply(that, args);

        if (typeof finalResult === 'undefined') finalResult = result;
      });
    }

    return finalResult;
  }

  /**
   * 解析名称（注意空格、分号）
   */
  public resolveNames(_names: string): string[] {
    let names: string | string[] = _names;
    names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '');
    names = names.replace(/[,/]+/g, ' ');
    names = names.split(' ');

    return names;
  }

  /**
   * 解析名称（注意点号）
   */
  public resolveName(name: string): FuncResolveNameReturnInterface {
    const newName: FuncResolveNameReturnInterface = {
      original: '',
      value: '',
      namespace: '',
    };
    const parts = name.split('.');

    newName.original = name;
    newName.value = parts[0];
    newName.namespace = 'base'; // 基本命名空间

    // 指定命名空间
    if (parts.length > 1 && parts[1] !== '') {
      newName.namespace = parts[1];
    }

    return newName;
  }
}

export default EventEmitter;
