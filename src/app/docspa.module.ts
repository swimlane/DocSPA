import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createCustomElement } from '@angular/elements';

import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { preset } from '@swimlane/docspa-remark-preset';
import {
  DocspaCoreModule, DocsifyPluginsModule,
  RuntimeContentModule, MarkdownModule, MarkdownElementsModule, MARKDOWN_CONFIG_TOKEN
} from '@swimlane/docspa-core';
import { DocspaStackblitzModule } from '@swimlane/docspa-stackblitz';

import { EditOnGithubComponent } from './plugins/edit-on-github';
import { TabsPluginModule } from './plugins/tabs.module';
import { GridPluginModule } from './plugins/grid.module';
import { timestampPlugin } from './plugins/test-docsify-plugin';

import { config } from '../docspa.config';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    EditOnGithubComponent
  ],
  imports: [
    CommonModule,
    DocspaCoreModule.forRoot(config, environment),
    RuntimeContentModule.forRoot({
      imports: [
        CommonModule,
        NgxChartsModule,
        BrowserAnimationsModule
      ],
    }),
    MarkdownModule.forRoot(),
    MarkdownElementsModule.forRoot(),
    DocsifyPluginsModule.forRoot({
      plugins: [
        timestampPlugin
      ]
    }),
    DocspaStackblitzModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.WARN }),
    TabsPluginModule,
    GridPluginModule,
  ],
  exports: [
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  entryComponents: [
    EditOnGithubComponent
  ],
  providers: [
    { provide: MARKDOWN_CONFIG_TOKEN, useValue: preset }
  ]
})
export class DocspaModule {
  constructor(private injector: Injector) {
    const content = createCustomElement(EditOnGithubComponent, { injector: this.injector });
    customElements.define(EditOnGithubComponent.is, content);
  }
}
