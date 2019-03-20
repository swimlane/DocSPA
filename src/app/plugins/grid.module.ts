import { NgModule } from '@angular/core';
import { MarkdownService } from '@swimlane/docspa-core';
import { customBlocks } from '@swimlane/docspa-remark-preset';

@NgModule({
})
export class GridPluginModule {
  constructor(markdownService: MarkdownService) {

    require('style-loader!./grid.css');

    // Adds a remarkplugin to process tab blocks
    markdownService.remarkPlugins.push([customBlocks, {
      grid: {
        classes: 'grid',
        title: 'optional'
      }
    }]);
  }
}

