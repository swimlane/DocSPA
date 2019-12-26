import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { LoggerModule } from 'ngx-logger';

// Internal
import { MarkdownElementsModule } from './modules/markdown-elements/markdown-elements.module';
import { MarkdownModule } from './modules/markdown/markdown.module';

import { SettingsService } from './services/settings.service';
import { FetchService } from './services/fetch.service';
import { RouterService } from './services/router.service';
import { CacheInterceptor } from './services/cache.interceptor';
import { HooksService } from './services/hooks.service';

import { DocSPACoreComponent } from './docspa-core.component';
import { SafeHtmlPipe } from './services/safe-html.pipe';

import { DOCSPA_CONFIG_TOKEN, DOCSPA_ENVIRONMENT } from './docspa-core.tokens';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MarkdownModule,
    LoggerModule,
    MarkdownElementsModule,
    RouterModule
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
    HooksService,
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
  ]
})
export class DocspaCoreModule {
  static forRoot(config: any = {}, environment: any = {}): ModuleWithProviders<DocspaCoreModule> {
    return {
      ngModule: DocspaCoreModule,
      providers: [
        { provide: DOCSPA_ENVIRONMENT, useValue: environment },
        { provide: DOCSPA_CONFIG_TOKEN, useValue: config }
      ]
    };
  }

  constructor(hooks: HooksService) {
    hooks.init.call();
  }
}
