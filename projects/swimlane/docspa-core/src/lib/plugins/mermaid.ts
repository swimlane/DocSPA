import visit from 'unist-util-visit';

export function mermaidHook(hook, vm) {
  hook.doneEach(() => window['mermaid'].init());
}

export function mermaid() {
  return transformer;

  function transformer(tree, file) {
    visit(tree, 'code', visitor);
  }

  function visitor(node, index, parent) {
    const { lang, value } = node;
    if (lang === 'mermaid') {
      const newNode = {
        type: 'html',
        value: `<div class="mermaid">${value}</div>`
      };
      parent.children.splice(index, 1, newNode);
      return node;
    }
  }
}

