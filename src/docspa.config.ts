import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';
import { docspaRemarkPreset, prism, runtime, mermaid } from '@swimlane/docspa-remark-preset';

import { tabsHook } from './app/plugins';

export const config = {
  name: 'DocSPA',
  basePath: 'docs/',
  homepage: 'README.md',
  notFoundPage: '_404.md',
  sideLoad: [
    '_sidebar.md',
    '_navbar.md',
    '_right_sidebar.md',
    '_footer.md'
  ],
  coverpage: '_coverpage.md',
  plugins: [
    window['EditOnGithubPlugin'].create('https://github.com/swimlane/docspa/blob/master/src/docs/', null, '✎ Edit this page'),
    tabsHook
  ],
  remarkPlugins: [
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
    '--base-background-color': '#F5F7F9',
    '--sidebar-background': '#F5F7F9',
    '--cover-background-color': 'linear-gradient(to left bottom, hsl(211, 100%, 85%) 0%,hsl(169, 100%, 85%) 100%)'
  }
};
