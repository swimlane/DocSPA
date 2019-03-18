import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { RuntimeContentComponent, FOR_ROOT_OPTIONS_TOKEN } from './runtime-content.component';

@NgModule({
  declarations: [
    RuntimeContentComponent
  ],
  bootstrap: [],
  entryComponents: [
    RuntimeContentComponent
  ]
})
export class RuntimeContentModule {
  static forRoot(config: any): ModuleWithProviders {
    return {
      ngModule: RuntimeContentModule,
      providers: [
        {
          provide: FOR_ROOT_OPTIONS_TOKEN,
          useValue: config
        }
      ]
    };
  }

  constructor(private injector: Injector) {
    const content = createCustomElement(RuntimeContentComponent, { injector: this.injector });
    customElements.define(RuntimeContentComponent.is, content);
  }
}
