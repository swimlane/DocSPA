export * from './mermaid';
export * from './prisim';
export * from './runtime';
export * from './misc';
export * from './links';

// For backwards compatibility pre-docspa-remark-preset, remove in v2
export * from '@swimlane/docspa-remark-preset';
import { docspaRemarkPreset } from '@swimlane/docspa-remark-preset';
import { runtime } from './runtime';

export const defaultRemarkPlugins = [
  ...docspaRemarkPreset,
  runtime
];

