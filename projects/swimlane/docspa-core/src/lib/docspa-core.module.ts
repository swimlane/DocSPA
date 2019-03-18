import { NgModule, Compiler, Injector, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { createCustomElement } from '@angular/elements';

import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

// Services
import { SettingsService } from './services/settings.service';
import { FetchService } from './services/fetch.service';
import { MarkdownService } from './modules/markdown/markdown.service';
import { RouterService } from './services/router.service';
import { CacheInterceptor } from './services/cache.interceptor';
import { PluginsService } from './services/plugins.service';

// TODO: Make optional
import { MarkdownElementsModule } from './modules/markdown-elements/markdown-elements.module';
import { RuntimeContentModule } from './modules/runtime-content/runtime-content.module';
import { EmbedStackblitzModule } from './modules/embed-stackblitz/embed-stackblitz.module';
import { UseDocsifyPluginsModule } from './modules/docsify-plugins.module';
import { MarkdownModule } from './modules/markdown/markdown.module';

import { DocSPACoreComponent } from './docspa-core.component';
import { SafeHtmlPipe } from './services/safe-html.pipe';

export function createJitCompiler() {
  return new (JitCompilerFactory as any)([{
    useDebug: false,
    useJit: true
  }]).createCompiler();
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    // Move these:
    LoadingBarModule,
    LoadingBarHttpClientModule,
    MarkdownModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.WARN }),
    MarkdownElementsModule,
    RuntimeContentModule,
    EmbedStackblitzModule,
    UseDocsifyPluginsModule,
  ],
  declarations: [
    DocSPACoreComponent,
    SafeHtmlPipe,
  ],
  exports: [
    DocSPACoreComponent,
    SafeHtmlPipe,
  ],
  providers: [
    SettingsService,
    FetchService,
    RouterService,
    PluginsService,
    { provide: Compiler, useFactory: createJitCompiler },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
  ]
})
export class DocspaCoreModule {
  static forRoot(config: any = {}, environment: any = {}): ModuleWithProviders {
    return {
      ngModule: DocspaCoreModule,
      providers: [
        { provide: 'environment', useValue: { ...config.environment, ...environment } },
        { provide: 'config', useValue: config }
      ]
    };
  }

  constructor(pluginsService: PluginsService) {
    pluginsService.initPlugins();
  }
}
