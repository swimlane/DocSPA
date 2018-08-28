export * from './misc';
export * from './links';
export * from './mermaid';

export { runtime } from '@swimlane/docspa-remark-preset/dist/module/plugins/runtime';
export { prism } from '@swimlane/docspa-remark-preset/dist/module/plugins/prism';

import { docspaRemarkPreset, runtime } from '@swimlane/docspa-remark-preset';

export const defaultRemarkPlugins = [
  ...docspaRemarkPreset,
  runtime
];

