import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { createCustomElement } from '@angular/elements';

import { DocspaSearchComponent } from './docspa-search.component';

@NgModule({
  declarations: [DocspaSearchComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [DocspaSearchComponent],
  entryComponents: [DocspaSearchComponent]
})
export class DocspaSearchModule {
  constructor(
    private injector: Injector
  ) {
    const content = createCustomElement(DocspaSearchComponent, { injector: this.injector });
    customElements.define(DocspaSearchComponent.is, content);
  }
}
