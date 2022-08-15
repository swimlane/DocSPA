import { CommonModule } from '@angular/common';
import { NgModule, Injector, ModuleWithProviders, Compiler } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import '@angular/platform-browser-dynamic';
import { prism } from '@swimlane/docspa-remark-preset';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';

import { MarkdownService } from '../../modules/markdown/markdown.service';
import { RuntimeContentComponent } from './runtime-content.component';
import { runtime } from './runtime';
import { DynamicComponentDirective, DynamicComponentOptions } from './dynamic-component.directive';
import { RuntimeElement } from './dynamic-element';
import { DynamicContentService } from './dynamic-content.service';

export function createJitCompiler() {
  return new (JitCompilerFactory as any)([{
    useDebug: false,
    useJit: true
  }]).createCompiler();
}

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RuntimeContentComponent,
    DynamicComponentDirective
  ],
  providers: [DynamicContentService]
})
export class RuntimeContentModule {
  static forRoot(config: any): ModuleWithProviders<RuntimeContentModule> {
    return {
      ngModule: RuntimeContentModule,
      providers: [
        DynamicContentService,
        { provide: DynamicComponentOptions, useValue: { ngModuleMetadata: config } },
        { provide: Compiler, useFactory: createJitCompiler }
      ]
    };
  }

  constructor(private injector: Injector, markdownService: MarkdownService) {
    const content = createCustomElement(RuntimeContentComponent, { injector: this.injector });
    customElements.define(RuntimeContentComponent.is, content);

    const plugins =  markdownService.remarkPlugins;

    // Adds a remarkplugin for runtime code blocks
    // Needs to be before prism (this is annoying)
    const idx = plugins.indexOf(prism as any);
    if (idx > 0) {
      plugins.splice(idx - 1, 0, runtime);
    } else {
      plugins.push(runtime);
    }

    RuntimeElement.injector = injector;
    customElements.define('runtime-element', RuntimeElement, { extends: 'template' });
  }
}


