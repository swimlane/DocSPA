import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';
import { docspaRemarkPreset, prism, runtime, mermaid } from '@swimlane/docspa-remark-preset';
import reporter from 'vfile-reporter';

import style from './app/plugins/markdown-style';

import { tabsHook } from './app/plugins';

/* For testing */
export function timestampPlugin(hook) {
  hook.beforeEach((md: string) => {
    return `**${new Date()}**\n\n${md}`;
  });
  hook.afterEach((html: string) => {
    return `${html}<!-- HTML generated ${new Date()} -->`;
  });
}

export const config = {
  basePath: 'docs/',
  homepage: 'README.md',
  notFoundPage: '_404.md',
  sideLoad: {
    sidebar: '_sidebar.md',
    navbar: '_navbar.md',
    rightSidebar: '/_right_sidebar.md',
    footer: '/_footer.md'
  },
  coverpage: '_coverpage.md',
  plugins: [
    tabsHook,
    // timestampPlugin
  ],
  remarkPlugins: [
    style,
    ...docspaRemarkPreset,
    runtime,
    mermaid,
    prism
  ],
  remarkReporter: reporter,
  runtimeModules: [
    CommonModule,
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  environment,
  themeColor: '#0074d9',
  theme: {}
};
