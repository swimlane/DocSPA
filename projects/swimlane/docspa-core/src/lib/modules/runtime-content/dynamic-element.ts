import { NgModule, Injector, ComponentRef } from '@angular/core';
import { DynamicComponentOptions } from './dynamic-component.directive';
import { DynamicContentService } from './dynamic-content.service';

export class RuntimeElement extends HTMLTemplateElement {
  static injector: Injector = null;

  private options: NgModule = {
    declarations: [],
    imports: [],
    providers: [],
    schemas: []
  };

  private component: ComponentRef<any>;
  private dynamicContentService: DynamicContentService;

  constructor() {
    super();
    this.options = RuntimeElement.injector.get(DynamicComponentOptions).ngModuleMetadata;
    this.dynamicContentService = RuntimeElement.injector.get(DynamicContentService);
    this.style.display = 'contents';
  }

  connectedCallback(): void {
    const selector = this.getAttribute('selector') || '';
    const context = this.getAttribute('context') || Object.create(null);
    const template = this.getAttribute('template') || this.innerHTML.trim();

    const cmpType = DynamicContentService.createComponentType({
      selector,
      template
    }, context);

    const moduleType = DynamicContentService.createNgModuleType({
      ...this.options,
      declarations: [cmpType]
    });

    this.dynamicContentService.attach(moduleType, cmpType, this)
      .then(component => this.component = component);
  }

  disconnectedCallback() {
    this.dynamicContentService.detach(this.component);
  }
}
