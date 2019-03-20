import { environment } from './environments/environment';

// A web component
import './app/plugins/lazy-img';

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
  ],
  environment,
  theme: {
    '--theme-color': '#0074d9'
  }
};
