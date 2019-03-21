import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
  RuntimeContentModule, MarkdownModule, ThemeModule, MarkdownElementsModule
} from '@swimlane/docspa-core';
import { plugins, reporter, prism, runtime, mermaid } from '@swimlane/docspa-remark-preset';

import { config } from '../docspa.config';

import { EditOnGithubComponent } from './plugins/edit-on-github';
import style from './plugins/markdown-style';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TabsPluginModule } from './plugins/tabs.module';
import { GridPluginModule } from './plugins/grid.module';

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
      imports: [
        CommonModule,
        NgxChartsModule,
        BrowserAnimationsModule
      ],
    }),
    MarkdownModule.forRoot({
      plugins: [
        style,
        ...plugins,
        runtime,
        mermaid,
        prism
      ],
      reporter
    }),
    ThemeModule.forRoot({
      theme: {
        '--theme-color': '#0074d9'
      }
    }),
    MarkdownElementsModule.forRoot(),
    UseDocsifyPluginsModule,
    EmbedStackblitzModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.WARN }),
    TabsPluginModule,
    GridPluginModule,
    NgxChartsModule,
    LoadingBarModule.forRoot(),
    LoadingBarHttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    })
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
