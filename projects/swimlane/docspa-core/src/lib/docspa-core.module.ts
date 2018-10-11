import { NgModule, Compiler, Injector, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { createCustomElement } from '@angular/elements';

import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

// Services
import { SettingsService } from './services/settings.service';
import { FetchService } from './services/fetch.service';
import { MarkdownService } from './services/markdown.service';
import { RouterService } from './services/router.service';

// Custom Elements
import { MadeWithDocSPAComponent } from './custom-components/made-with-love';
import { RuntimeContentComponent } from './custom-components/runtime-content.component';
import { TOCComponent } from './custom-components/toc';
import { TOCSearchComponent } from './custom-components/toc-search.component';
import { TOCPaginationComponent } from './custom-components/toc-pagination.component';
import { EmbedStackblitzComponent } from './custom-components/embed-stackblitz.component';
import { EmbedMarkdownComponent } from './custom-components/embed-file';
import { EnvVarComponent } from './custom-components/env-var.component';
import { MdLinkComponent } from './custom-components/md-link.component';
import { MdPrintComponent } from './custom-components/md-print.component';

import { DocSPACoreComponent } from './docspa-core.component';
import { SafeHtmlPipe } from './services/safe-html.pipe';

export function createJitCompiler() {
  return new (JitCompilerFactory as any)([{
    useDebug: false,
    useJit: true
  }]).createCompiler();
}

const elements = [
  MadeWithDocSPAComponent,
  RuntimeContentComponent,
  TOCComponent,
  EmbedStackblitzComponent,
  EmbedMarkdownComponent,
  EnvVarComponent,
  TOCSearchComponent,
  TOCPaginationComponent,
  MdLinkComponent,
  MdPrintComponent
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LoadingBarModule,
    LoadingBarHttpClientModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.TRACE })
  ],
  declarations: [
    DocSPACoreComponent,
    SafeHtmlPipe,
    ...elements
  ],
  exports: [
    DocSPACoreComponent,
    SafeHtmlPipe,
    ...elements
  ],
  providers: [
    SettingsService,
    FetchService,
    MarkdownService,
    RouterService,
    { provide: Compiler, useFactory: createJitCompiler }
  ],
  entryComponents: [
    ...elements
  ]
})
export class DocspaCoreModule {
  constructor(private injector: Injector) {
    elements.map((Constructor: any) => {
      if (Constructor.is) {
        const content = createCustomElement(Constructor, { injector: this.injector });
        customElements.define(Constructor.is, content);
      }
    });
  }

  static forRoot(config: any = {}, environment: any = {}): ModuleWithProviders {
    return {
      ngModule: DocspaCoreModule,
      providers: [
        { provide: 'environment', useValue: { ...config.environment, ...config } },
        { provide: 'config', useValue: config }
      ]
    };
  }
}
