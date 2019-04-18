import { NgModule, ModuleWithProviders } from '@angular/core';
import { MarkdownService, MARKDOWN_CONFIG_TOKEN } from './markdown.service';

@NgModule({
  declarations: [],
  bootstrap: [],
  entryComponents: []
})
export class MarkdownModule {
  public static forRoot(config?: any): ModuleWithProviders {
    return {
      ngModule: MarkdownModule,
      providers: [
        MarkdownService,
        {
          provide: MARKDOWN_CONFIG_TOKEN,
          useFactory() {
            return config;
          }
        }
      ]
    };
  }
}
