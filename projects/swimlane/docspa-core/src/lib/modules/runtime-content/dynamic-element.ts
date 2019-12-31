import { NgModule, Injector, ApplicationRef, Compiler, Type, Component, ComponentRef } from '@angular/core';
import { DynamicComponentOptions } from './dynamic-component.directive';

export class RuntimeElement extends HTMLTemplateElement {
  static injector: Injector;

  private options: NgModule = {
    declarations: [],
    imports: [],
    providers: [],
    schemas: []
  };

  private template: string;
  private compiler: Compiler;
  private selector: string;
  private context: any;
  private applicationRef: ApplicationRef;
  private component: ComponentRef<any>;
  private cmpType: Type<any>;
  private moduleType: Type<any>;

  constructor() {
    super();
    this.compiler = RuntimeElement.injector.get(Compiler);
    this.options = RuntimeElement.injector.get(DynamicComponentOptions).ngModuleMetadata;
    this.applicationRef = RuntimeElement.injector.get<ApplicationRef>(ApplicationRef);

    this.style.display = 'contents';
  }

  connectedCallback(): void {
    this.selector = this.getAttribute('selector') || '';
    this.context = this.getAttribute('context') || '{}';
    this.template = this.getAttribute('template') || this.innerHTML.trim();

    if (typeof this.context === 'string') {
      try {
        this.context = JSON.parse(this.context);
      } catch(err) {
        this.context  = {};
      }
    }

    this.cmpType = this.createComponentType();
    this.moduleType = this.createNgModuleType(this.cmpType);
    const childInjector = Injector.create({providers: [], parent: RuntimeElement.injector});

    this.compiler.compileModuleAndAllComponentsAsync<any>(this.moduleType).then(factory => {
      for (let i = factory.componentFactories.length - 1; i >= 0; i--) {
        if (factory.componentFactories[i].componentType === this.cmpType) {
          return factory.componentFactories[i];
        }
      }
      throw 'err';
    }).then(cmpFactory => {
      this.component = cmpFactory.create(childInjector, null, this);
      if (this.context) {
        Object.assign(this.component.instance, this.context);
      }
      this.applicationRef.attachView(this.component.hostView);
    });
  }

  disconnectedCallback() {
    if (this.component) {
      this.component.destroy();
    }

    if (this.compiler) {
      if (this.cmpType) {
        this.compiler.clearCacheFor(this.cmpType);
      }
      if (this.moduleType) {
        this.compiler.clearCacheFor(this.moduleType);
      }
    }
  }

  private createComponentType(): Type<any> {
    const metadata = new Component({
      selector: this.selector,
      template: this.template,
    });
    const cmpClass = class _ {
    };
    return Component(metadata)(cmpClass);
  }

  private createNgModuleType(componentType: Type<any>) {
    const declarations = this.options.declarations ? [...this.options.declarations, componentType] : [componentType];
    const moduleMeta: NgModule = {
      ...this.options,
      declarations
    };
    return NgModule(moduleMeta)(class _ { });
  }
}