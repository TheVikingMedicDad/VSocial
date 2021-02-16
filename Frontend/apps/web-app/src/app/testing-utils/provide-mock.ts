import { Provider, Type } from '@angular/core';

// Source: https://github.com/brandonroberts/ng-atl-2018/tree/done/src/app

export type TestingMock<T> = T & { [P in keyof T]: T[P] & jest.Mock<T> };

function createMock<T>(type: Type<T>): TestingMock<T> {
  const target: any = {};

  function installProtoMethods(proto: any) {
    if (proto === null || proto === Object.prototype) {
      return;
    }

    for (const key of Object.getOwnPropertyNames(proto)) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, key);

      if (typeof descriptor.value === 'function' && key !== 'constructor') {
        target[key] = jest.fn();
      }
    }

    installProtoMethods(Object.getPrototypeOf(proto));
  }

  installProtoMethods(type.prototype);

  return target;
}

export function provideMock<T>(type: Type<T>): Provider {
  return {
    provide: type,
    useFactory: () => createMock(type),
  };
}
