import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule, Injector } from '@angular/core';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
  /// HashLocationStrategy
} from '@angular/common';
import { createCustomElement } from '@angular/elements';

import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { AppComponent } from './app.component';
import {
  DocspaCoreModule, EmbedStackblitzModule, UseDocsifyPluginsModule,
  RuntimeContentModule, MarkdownModule, ThemeModule
} from '@swimlane/docspa-core';
import { EditOnGithubComponent } from './plugins/edit-on-github';

import { config } from '../docspa.config';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    EditOnGithubComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    DocspaCoreModule.forRoot(config),
    RuntimeContentModule.forRoot({
      imports: config.runtimeModules
    }),
    MarkdownModule.forRoot({
      plugins: config.remarkPlugins,
      reporter: config.remarkReporter
    }),
    ThemeModule.forRoot({
      theme: {
        '--theme-color': config.themeColor,
        ...config.theme
      }
    }),
    UseDocsifyPluginsModule,
    EmbedStackblitzModule,
    NgxChartsModule,
    LoadingBarModule.forRoot(),
    LoadingBarHttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    }),
    LoggerModule.forRoot({ level: NgxLoggerLevel.WARN })
  ],
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  bootstrap: [AppComponent],
  entryComponents: [EditOnGithubComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const content = createCustomElement(EditOnGithubComponent, { injector: this.injector });
    customElements.define(EditOnGithubComponent.is, content);
  }

  ngDoBootstrap() {}
}
