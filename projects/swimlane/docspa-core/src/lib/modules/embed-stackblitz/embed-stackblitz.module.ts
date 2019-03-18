import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';

import { EmbedStackblitzComponent } from './embed-stackblitz.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    EmbedStackblitzComponent
  ],
  bootstrap: [],
  entryComponents: [
    EmbedStackblitzComponent
  ]
})
export class EmbedStackblitzModule {
  constructor(private injector: Injector) {
    const content = createCustomElement(EmbedStackblitzComponent, { injector: this.injector });
    customElements.define(EmbedStackblitzComponent.is, content);
  }
}
