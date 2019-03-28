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
import { ServiceWorkerModule } from '@angular/service-worker';

import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { preset } from '@swimlane/docspa-remark-preset';
import {
  DocspaCoreModule, EmbedStackblitzModule, DocsifyPluginsModule,
  RuntimeContentModule, MarkdownModule, MarkdownElementsModule
} from '@swimlane/docspa-core';

import { AppComponent } from './app.component';

import { config } from '../docspa.config';

import { EditOnGithubComponent } from './plugins/edit-on-github';
import { TabsPluginModule } from './plugins/tabs.module';
import { GridPluginModule } from './plugins/grid.module';
import { timestampPlugin } from './plugins/test-docsify-plugin';

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
    DocspaCoreModule.forRoot(config, environment),
    RuntimeContentModule.forRoot({
      imports: [
        CommonModule,
        NgxChartsModule,
        BrowserAnimationsModule
      ],
    }),
    MarkdownModule.forRoot(preset),
    MarkdownElementsModule.forRoot(),
    DocsifyPluginsModule.forRoot({
      plugins: [
        timestampPlugin
      ]
    }),
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
