import { NgModule, Compiler, Injector, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';

import { LoggerModule } from 'ngx-logger';

// Internal
import { MarkdownElementsModule } from './modules/markdown-elements/markdown-elements.module';
import { MarkdownModule } from './modules/markdown/markdown.module';

import { SettingsService } from './services/settings.service';
import { FetchService } from './services/fetch.service';
import { RouterService } from './services/router.service';
import { CacheInterceptor } from './services/cache.interceptor';
import { PluginsService } from './services/plugins.service';
import { HooksService } from './services/hooks.service';

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
    MarkdownModule,
    LoggerModule,
    MarkdownElementsModule
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
    HooksService,
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

  constructor(pluginsService: PluginsService, hooks: HooksService) {
    pluginsService.initPlugins();
    hooks.init.call();
  }
}
