import { NgModule, Injector, InjectionToken } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';

// Custom Elements
import { MadeWithDocSPAComponent } from './made-with-love';
import { TOCComponent } from './toc';
import { TOCSearchComponent } from './toc-search.component';
import { EnvVarComponent } from './env-var.component';
import { MdPrintComponent } from './md-print.component';
import { TOCPaginationComponent } from './toc-pagination.component';
import { EmbedMarkdownComponent } from '../../custom-components/embed-file';

const elements = [
  MadeWithDocSPAComponent,
  TOCComponent,
  EnvVarComponent,
  TOCSearchComponent,
  MdPrintComponent,
  TOCPaginationComponent,
  EmbedMarkdownComponent
];

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    ...elements
  ],
  declarations: [
    ...elements
  ],
  bootstrap: [],
  entryComponents: [
    ...elements
  ]
})
export class MarkdownElementsModule {
  constructor(private injector: Injector) {
    elements.map((Constructor: any) => {
      if (Constructor.is) {
        const content = createCustomElement(Constructor, { injector: this.injector });
        customElements.define(Constructor.is, content);
      }
    });
  }
}
