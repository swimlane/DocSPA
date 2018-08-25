// For backwards compatibility pre-docspa-remark-preset, remove in v2
export * from '@swimlane/docspa-remark-preset/plugins/mermaid';

export function mermaidHook(hook, vm) {
  hook.doneEach(() => window['mermaid'].init());
}
