import { Injectable, Type, Component, NgModule, ComponentRef, Compiler, ApplicationRef, Injector, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DynamicContentService {
  static createComponentType(metadata: Component, context: any): Type<any> {
    if (typeof context === 'string') {
      try {
        context = JSON.parse(context);
      } catch (err) {
        context  = {};
      }
    }
    class RuntimeComponent {
      constructor() {
        Object.assign(this, context);
      }
    }
    return Component(metadata)(RuntimeComponent);
  }

  static createNgModuleType(metadata: NgModule): Type<any> {
    class RuntimeModule {
    }
    return NgModule(metadata)(RuntimeModule);
  }

  constructor(
    private compiler: Compiler,
    private applicationRef: ApplicationRef,
    private injector: Injector
  ) {
  }

  attach(moduleType: Type<any>, componentType: Type<any>, element: Element | ViewContainerRef) {
    const injector = Injector.create({providers: [], parent: this.injector});

    return this.compiler
      .compileModuleAndAllComponentsAsync<any>(moduleType)
      .then(({ ngModuleFactory, componentFactories }) => {
        const componentFactory = componentFactories.find(f => f.componentType === componentType);
        if (!componentFactory) { return; }

        if (element instanceof ViewContainerRef) {
          element.clear();
          return element.createComponent(componentFactory, 0, injector);
        }

        const ngModule = ngModuleFactory.create(injector);
        const componentRef = componentFactory.create(injector, null, element, ngModule);
        this.applicationRef.attachView(componentRef.hostView);

        return componentRef;
      });
  }

  detach(component: ComponentRef<any>) {
    if (component) {
      component.destroy();
    }

    if (component.componentType) {
      this.compiler.clearCacheFor(component.componentType);
    }
  }
}
