import { NgModule, Injector, InjectionToken, Optional, ModuleWithProviders, Inject } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';

import visit from 'unist-util-visit';
import * as MDAST from 'mdast';
import * as UNIFIED from 'unified';

import { customSmartCodes } from '../../shared/shortcodes';
import { MarkdownService } from '../../modules/markdown/markdown.service';
import { LocationService } from '../../services/location.service';

// Custom Elements
import { MadeWithDocSPAComponent } from './made-with-love';
import { TOCComponent } from './toc';
import { TOCSearchComponent } from './toc-search.component';
import { EnvVarComponent } from './env-var.component';
import { MdPrintComponent } from './md-print.component';
import { TOCPaginationComponent } from './toc-pagination.component';
import { EmbedMarkdownComponent } from './embed-file';

export const MARKDOWNELEMENTS_CONFIG_TOKEN = new InjectionToken<any>( 'MarkdownElementsModule.forRoot() configuration.' );

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
        { provide: MARKDOWNELEMENTS_CONFIG_TOKEN, useValue: elements }
      ]
    };
  }

  constructor(
    private injector: Injector,
    markdownService: MarkdownService,
    locationService: LocationService,
    @Optional() @Inject(MARKDOWNELEMENTS_CONFIG_TOKEN) _elements: any
  ) {
    if (_elements) {
      _elements.map((Constructor: any) => {
        if (Constructor.is) {
          const content = createCustomElement(Constructor, { injector: this.injector });
          customElements.define(Constructor.is, content);
        }
      });

      const smartCodePaths = (): UNIFIED.Transformer => {
        return (tree: MDAST.Root, vfile: any) => {
          vfile.data = vfile.data || {};
          return visit(tree, 'shortcode', (node: any) => {
            if (node.identifier === 'toc' || node.identifier === 'include') {

              node.data = node.data || {};
              node.data.hProperties = node.data.hProperties || {};
              const path = node.data.originalPath = node.data.hProperties.path;

              if (path === '' && node.identifier === 'toc') {
                node.data.hProperties.path = vfile.data.base;
              } else if (!LocationService.isAbsolutePath(path)) {
                node.data.hProperties.path = locationService.prepareLink(path, vfile.history[0]);
              }
            }
            return node;
          });
        };
      };

      markdownService.remarkPlugins.push(smartCodePaths);

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
