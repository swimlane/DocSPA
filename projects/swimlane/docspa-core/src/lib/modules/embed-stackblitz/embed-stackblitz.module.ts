import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';

import { MarkdownService } from '../../modules/markdown/markdown.service';
import { customSmartCodes } from '../../shared/shortcodes';
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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: EmbedStackblitzModule,
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
