import throttle from 'throttleit';

type AnyFunction = (...args: any[]) => any;

export * from 'throttleit';

/**
 * Throttle decorator
 *
 *  class MyClass {
 *    throttleable(10)
 *    myFn() { ... }
 *  }
 */
export function throttleable(duration: number, options?: any) {
  return function innerDecorator(target: any, key: string, descriptor: any) {
    return {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: function getter() {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: descriptor.enumerable,
          value: throttle(descriptor.value, duration, options)
        });

        return this[key];
      }
    };
  };
}
