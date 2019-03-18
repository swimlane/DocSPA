import { NgModule, ModuleWithProviders } from '@angular/core';
import { MarkdownService, FOR_ROOT_OPTIONS_TOKEN } from './markdown.service';

@NgModule({
  declarations: [],
  bootstrap: [],
  entryComponents: []
})
export class MarkdownModule {
  static forRoot(config: any): ModuleWithProviders {
    return {
      ngModule: MarkdownModule,
      providers: [
        MarkdownService,
        {
          provide: FOR_ROOT_OPTIONS_TOKEN,
          useValue: config
        }
      ]
    };
  }
}
