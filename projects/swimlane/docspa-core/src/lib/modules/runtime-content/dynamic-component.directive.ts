// Based on DynamicComponentDirective from https://github.com/lacolaco/ng-dynamic/

import {
  ComponentRef,
  Directive,
  Input,
  NgModule,
  SimpleChanges,
  Type,
  ViewContainerRef,
  OnDestroy,
  OnChanges
} from '@angular/core';

import { DynamicContentService } from './dynamic-content.service';

/**
 * options for dynamicComponentModule
 */
export class DynamicComponentOptions {
  /**
   * identifies ngModule used by compilation.
   */
  ngModuleMetadata: NgModule;
}

/**
 * DynamicComponent is a directive to create dynamic component.
 *
 * Example:
 *
 * ```ts
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div *dynamicComponent="template; context: self; selector:'my-component'"></div>
 *   `
 * })
 * export class AppComponent {
 *   self = this;
 *
 *   template = `
 *   <div>
 *     <p>Dynamic Component</p>
 *   </div>`;
 * }
 * ```
 *
 * Result:
 *
 * ```html
 * <my-component>
 *    <div>
 *      <p>Dynamic Component</p>
 *    </div>
 * </my-component>
 * ```
 *
 */
@Directive({
  selector: '[dynamicComponent]',
})
export class DynamicComponentDirective implements OnChanges, OnDestroy {
  @Input('dynamicComponent') template: string;
  @Input('dynamicComponentSelector') selector: string;
  @Input('dynamicComponentContext') context: any;

  private component: ComponentRef<any>;
  private moduleType: any;
  private cmpType: any;

  constructor(
    private options: DynamicComponentOptions,
    private vcRef: ViewContainerRef,
    private dynamicContentService: DynamicContentService
  ) { }

  private createComponentType(): Type<any> {
    const metadata = {
      selector: this.selector,
      template: this.template,
    };
    return DynamicContentService.createComponentType(metadata, this.context);
  }

  private createNgModuleType(componentType: Type<any>) {
    const declarations = [].concat(this.options.ngModuleMetadata.declarations || []);
    declarations.push(componentType);
    const moduleMeta: NgModule = {
      imports: this.options.ngModuleMetadata.imports,
      providers: this.options.ngModuleMetadata.providers,
      schemas: this.options.ngModuleMetadata.schemas,
      declarations: declarations
    };
    return DynamicContentService.createNgModuleType(moduleMeta);
  }

  ngOnChanges(_changes: SimpleChanges) {
    if (!this.template) {
      return;
    }
    this.cmpType = this.createComponentType();
    this.moduleType = this.createNgModuleType(this.cmpType);

    this.dynamicContentService.attach(this.moduleType, this.cmpType, this.vcRef).then(component => this.component = component);
  }

  ngOnDestroy() {
    this.dynamicContentService.detach(this.component);
  }
}
