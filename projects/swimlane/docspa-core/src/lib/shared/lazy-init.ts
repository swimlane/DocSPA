/**
 * lazyInitialize
 * Decorator to lazy initialize a value
 *
 * Example:
 *
 *  class A {
 *    @lazyInitialize
 *    get value() {
 *      return this.filter...
 *    }
 *  }
 *
 */
export default function lazyInitialize(target: any, key: string, descriptor: PropertyDescriptor) {
  const { configurable, enumerable, get, value } = descriptor;

  return {
    configurable,
    enumerable,
    get() {
      if (this === target) { return; }
      const newValue = get ? get.call(this) : value;

      Object.defineProperty(this, key, {
        configurable,
        enumerable,
        writable: true,
        value: newValue
      });

      return newValue;
    }
  };
}
