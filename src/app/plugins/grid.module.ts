import { NgModule } from "@angular/core";
import { MarkdownService } from "@swimlane/docspa-core";
import { customBlocks } from "@swimlane/docspa-remark-preset";

import "./grid.css";

@NgModule({})
export class GridPluginModule {
  constructor(markdownService: MarkdownService) {
    // Adds a remarkplugin to process tab blocks
    markdownService.remarkPlugins.push([
      customBlocks,
      {
        grid: {
          classes: "grid",
          title: "optional",
        },
      },
    ]);
  }
}
