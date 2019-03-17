// For backwards compatibility pre-docspa-remark-preset, remove in v2
export { mermaid } from '@swimlane/docspa-remark-preset/dist/module/plugins/mermaid';

export function mermaidHook(hook: any) {
  hook.doneEach(() => window['mermaid'].init());
}
