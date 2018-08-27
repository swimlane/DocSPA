import visit from 'unist-util-visit';
import mermaidApi from 'mermaid';

mermaidApi.initialize({
  startOnLoad: false
});

export function mermaid() {
  return function transformer(tree, file, next) {
    const hostElem = getHostElm();
    const items: any[] = [];

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid') {
        items.push({node, index, parent});
      }
    });

    const promises = items.map(async ({node, index, parent}) => {
      let value = node.value;
      try {
        value = await createMermaid(node.value);
        value = `<div class="mermaid" data-processed="true">${value}</div>`;
      } catch (err) {
        value = `<div class="mermaid">${value}</div>`;
      }
      parent.children.splice(index, 1, {
        type: 'html',
        value
      });
    });

    return Promise.all(promises).then(() => next());

    function createMermaid(code: string) {
      return new Promise((resolve, reject) => {
        mermaidApi.render(`mermaid-${Date.now()}`, code, resolve, hostElem);
      });
    }
  };

  function getHostElm() {
    try {
      let elm = document.querySelector('#mermaid-host-render');
      if (elm) {
        return elm;
      }
      elm = document.createElement('div');
      elm.id = 'mermaid-host-render';
      const main = document.querySelector('#main') || document.querySelector('body');
      if (main) {
        main.appendChild(elm);
        return elm;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }
}
