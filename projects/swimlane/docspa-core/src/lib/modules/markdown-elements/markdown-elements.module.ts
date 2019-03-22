import { NgModule, Injector, InjectionToken, Optional, ModuleWithProviders, Inject } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';

import { customSmartCodes } from '../../shared/shortcodes';
import { MarkdownService } from '../../modules/markdown/markdown.service';

// Custom Elements
import { MadeWithDocSPAComponent } from './made-with-love';
import { TOCComponent } from './toc';
import { TOCSearchComponent } from './toc-search.component';
import { EnvVarComponent } from './env-var.component';
import { MdPrintComponent } from './md-print.component';
import { TOCPaginationComponent } from './toc-pagination.component';
import { EmbedMarkdownComponent } from './embed-file';

/**
 * Convert [[toc]] smart-code to a TOC
 * Must be included after remark-shortcodes but before customSmartCodes

export const tocSmartCode = (): UNIFIED.Transformer => {
  return (tree: MDAST.Root, file: VFile) => {
    file.data = file.data || {};
    return visit(tree, 'shortcode', (node: ShortCode) => {
      if (node.identifier === 'toc') {
        node.attributes.path = node.attributes.path || file.data.base;
      }
      return true;
    });
  };
};*/


export const MarkdownElementsModule_FOR_ROOT_OPTIONS_TOKEN = new InjectionToken<any>( 'MarkdownElementsModule.forRoot() configuration.' );

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
    MadeWithDocSPAComponent,
    TOCComponent,
    EnvVarComponent,
    TOCSearchComponent,
    MdPrintComponent,
    TOCPaginationComponent,
    EmbedMarkdownComponent
  ],
  declarations: [
    MadeWithDocSPAComponent,
    TOCComponent,
    EnvVarComponent,
    TOCSearchComponent,
    MdPrintComponent,
    TOCPaginationComponent,
    EmbedMarkdownComponent
  ],
  bootstrap: [],
  entryComponents: [
    MadeWithDocSPAComponent,
    TOCComponent,
    EnvVarComponent,
    TOCSearchComponent,
    MdPrintComponent,
    TOCPaginationComponent,
    EmbedMarkdownComponent
  ]
})
export class MarkdownElementsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MarkdownElementsModule,
      providers: [
        { provide: MarkdownElementsModule_FOR_ROOT_OPTIONS_TOKEN, useValue: elements }
      ]
    };
  }

  constructor(
    private injector: Injector,
    markdownService: MarkdownService,
    @Optional() @Inject(MarkdownElementsModule_FOR_ROOT_OPTIONS_TOKEN) _elements: any
  ) {
    if (_elements) {
      _elements.map((Constructor: any) => {
        if (Constructor.is) {
          const content = createCustomElement(Constructor, { injector: this.injector });
          customElements.define(Constructor.is, content);
        }
      });

      // Adds a remarkplugin to short codes
      markdownService.remarkPlugins.push([customSmartCodes, {
        env: {
          tagName: 'md-env'
        },
        toc: {
          tagName: 'md-toc'
        },
        include: {
          tagName: 'md-include'
        }
      }]);
    }
  }
}
