import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { MarkdownService } from '../../modules/markdown/markdown.service';

import { RuntimeContentComponent, FOR_ROOT_OPTIONS_TOKEN } from './runtime-content.component';
import { runtime } from './runtime';
import { prism } from '@swimlane/docspa-remark-preset';


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

  constructor(private injector: Injector, markdownService: MarkdownService) {
    const content = createCustomElement(RuntimeContentComponent, { injector: this.injector });
    customElements.define(RuntimeContentComponent.is, content);

    const plugins =  markdownService.remarkPlugins;

    // Adds a remarkplugin for runtime code blocks
    // Needs to be before prism (this is annoying)
    const idx = plugins.indexOf(prism);
    if (idx > 0) {
      plugins.splice(idx - 1, 0, runtime);
    } else {
      plugins.push(runtime);
    }
  }
}
