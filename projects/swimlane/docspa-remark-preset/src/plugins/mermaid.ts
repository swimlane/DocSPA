import visit from 'unist-util-visit';
import mermaidApi from 'mermaid';

function createMermaid(code: string) {
  return new Promise((resolve, reject) => {
    try {
      mermaidApi.render(`mermaid-${Date.now()}`, code, resolve);
    } catch (err) {
      reject(err);
    }
  });
}

export function mermaid() {
  return function transformer(tree, file, next) {
    const items = [];

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid') {
        items.push({node, index, parent});
      }
    });

    const promises = items.map(async ({node, index, parent}) => {
      const value = await createMermaid(node.value);
      parent.children.splice(index, 1, {
        type: 'html',
        value
      });
    });

    Promise.all(promises).then(() => next());
  };
}
