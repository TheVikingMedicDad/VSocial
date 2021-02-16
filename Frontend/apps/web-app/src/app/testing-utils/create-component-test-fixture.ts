import { ComponentRef, DebugElement, InjectionToken, NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { ComponentFixture, TestBed, TestModuleMetadata } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

// Source: https://github.com/brandonroberts/ng-atl-2018/tree/done/src/app

export interface ComponentTestFixture<T> {
  readonly componentInstance: T;
  readonly componentRef: ComponentRef<T>; // componentRef is necessary for snapshot tests
  readonly nativeElement: HTMLElement;
  readonly debugElement: DebugElement;

  compile(detectChanges?: boolean): Promise<void>;

  detectChanges(): void;

  get<V>(type: Type<V> | InjectionToken<V>): V;

  getElement(selector: string): DebugElement;
}

type CreateComponentTestFixtureType<T> = TestModuleMetadata & {
  component: Type<T>;
  shallow?: boolean;
};

export function createComponentTestFixture<T>({
  component,
  shallow = true,
  ...testModuleMetadata
}: CreateComponentTestFixtureType<T>): ComponentTestFixture<T> {
  let componentFixture: ComponentFixture<T> | null;

  beforeEach(() => {
    TestBed.configureCompiler({ preserveWhitespaces: false } as any).configureTestingModule({
      schemas: [shallow ? NO_ERRORS_SCHEMA : []],
      declarations: [component, ...(testModuleMetadata.declarations || [])],
      providers: testModuleMetadata.providers,
      imports: [NoopAnimationsModule, ...(testModuleMetadata.imports || [])],
    });
  });

  afterEach(() => {
    componentFixture = null;
  });

  return {
    async compile(detectChanges = true) {
      await TestBed.compileComponents();
      componentFixture = TestBed.createComponent(component);

      if (detectChanges) {
        componentFixture.detectChanges();
      }
    },

    detectChanges() {
      if (!componentFixture) {
        throw attemptedTo('detect changes');
      }

      componentFixture.detectChanges();
    },

    get<V>(type: Type<V> | InjectionToken<V>): V {
      return TestBed.get(type);
    },

    get componentInstance() {
      if (!componentFixture) {
        throw attemptedTo('access componentInstance');
      }

      return componentFixture.componentInstance;
    },

    get componentRef() {
      if (!componentFixture) {
        throw attemptedTo('access componentRef');
      }

      return componentFixture.componentRef;
    },

    get nativeElement() {
      if (!componentFixture) {
        throw attemptedTo('access nativeElement');
      }

      return componentFixture.nativeElement;
    },

    get debugElement() {
      if (!componentFixture) {
        throw attemptedTo('access debugElement');
      }

      return componentFixture.debugElement;
    },

    getElement(selector: string): DebugElement {
      if (!componentFixture) {
        throw attemptedTo('access debugElement');
      }

      return componentFixture.debugElement.query(By.css(selector));
    },
  };
}

function attemptedTo(verb: string) {
  return new Error(`Attempted to ${verb} before compiling the component fixture`);
}
