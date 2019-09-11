import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';

import { EmbedStackblitzComponent } from './docspa-stackblitz.component';

import { MarkdownService, customSmartCodes } from '@swimlane/docspa-core';

@NgModule({
  declarations: [EmbedStackblitzComponent],
  imports: [
    CommonModule
  ],
  exports: [EmbedStackblitzComponent],
  bootstrap: [],
  entryComponents: [
    EmbedStackblitzComponent
  ]
})
export class DocspaStackblitzModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DocspaStackblitzModule,
    };
  }

  constructor(private injector: Injector, markdownService: MarkdownService) {
    const content = createCustomElement(EmbedStackblitzComponent, { injector: this.injector });
    customElements.define(EmbedStackblitzComponent.is, content);

    // Adds a remarkplugin to process `[[stack-blitz]]` blocks
    markdownService.remarkPlugins.push([customSmartCodes, {
      stackblitz: {
        tagName: 'embed-stackblitz'
      }
    }]);
  }
}
