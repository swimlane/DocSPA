import { NgModule, Injector, InjectionToken, Optional, ModuleWithProviders, Inject } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';

// Custom Elements
import { MadeWithDocSPAComponent } from './made-with-love';
import { TOCComponent } from './toc';
import { TOCSearchComponent } from './toc-search.component';
import { EnvVarComponent } from './env-var.component';
import { MdPrintComponent } from './md-print.component';
import { TOCPaginationComponent } from './toc-pagination.component';
import { EmbedMarkdownComponent } from './embed-file';

export const FOR_ROOT_OPTIONS_TOKEN = new InjectionToken<any>( 'MarkdownElementsModule.forRoot() configuration.' );

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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MarkdownElementsModule,
      providers: [
        { provide: FOR_ROOT_OPTIONS_TOKEN, useValue: elements }
      ]
    };
  }

  constructor(private injector: Injector, @Optional() @Inject(FOR_ROOT_OPTIONS_TOKEN) _elements: typeof elements) {
    if (_elements) {
      _elements.map((Constructor: any) => {
        if (Constructor.is) {
          const content = createCustomElement(Constructor, { injector: this.injector });
          customElements.define(Constructor.is, content);
        }
      });
    }
  }
}
