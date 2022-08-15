import { NgModule, ModuleWithProviders } from '@angular/core';
import { MarkdownService, MARKDOWN_CONFIG_TOKEN } from './markdown.service';

@NgModule({
    declarations: [],
    bootstrap: []
})
export class MarkdownModule {
  public static forRoot(config?: any): ModuleWithProviders<MarkdownModule> {
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
