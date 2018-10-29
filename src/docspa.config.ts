import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';
import { docspaRemarkPreset, prism, runtime, mermaid } from '@swimlane/docspa-remark-preset';
import style from './app/plugins/markdown-style';

import { tabsHook } from './app/plugins';

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
    tabsHook
  ],
  remarkPlugins: [
    style,
    ...docspaRemarkPreset,
    runtime,
    mermaid,
    prism
  ],
  runtimeModules: [
    CommonModule,
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  environment,
  theme: {
    '--theme-color': '#0089FF',
    '--theme-color-secondary-light': '#0074d92e',
    '--sidebar-width': '16rem',
    '--right-sidebar-width': '16rem',
    '--right-sidebar-border-color': 'none',
    '--base-background-color': '#F5F7F9',
    '--sidebar-background': '#F5F7F9',
    '--right-sidebar-background': '#FFF',
    '--cover-background-color': 'linear-gradient(to left bottom, hsl(211, 100%, 85%) 0%,hsl(169, 100%, 85%) 100%)'
  }
};
