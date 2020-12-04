import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { createCustomElement } from '@angular/elements';
import { MatPaginatorModule } from '@angular/material/paginator';

import { DocspaSearchComponent } from './docspa-search.component';

@NgModule({
  declarations: [DocspaSearchComponent],
  imports: [
    CommonModule,
    RouterModule,
    OverlayModule,
    MatPaginatorModule
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
