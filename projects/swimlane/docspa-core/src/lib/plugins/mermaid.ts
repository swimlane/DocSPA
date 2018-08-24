export function mermaidHook(hook, vm) {
  hook.doneEach(() => window['mermaid'].init());
}
