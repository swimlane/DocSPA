import visit from 'unist-util-visit';
import * as mermaidApi from 'mermaid/dist/mermaid.js';
import * as UNIFIED from 'unified';
import * as MDAST from 'mdast';

const supportsCustomElements = !!window['customElements'];

mermaidApi.initialize({
  startOnLoad: false
});

const MERMAID = 'mermaid';

export class MermaidElement extends HTMLElement {
  static is = 'md-mermaid';

  connectedCallback() {
    mermaidApi.init(undefined, this);
  }
}

export function mermaid(options: { [key: string]: any }): UNIFIED.Transformer {
  const config = {
    startOnLoad: false,
    arrowMarkerAbsolute: false,
    theme: 'default',
    useCustomElement: supportsCustomElements,
    ...options
  };

  mermaidApi.initialize(config);

  if (!config.useCustomElement) {
    // Fallback: look for unprocessed mermaid elements on a timer.
    setInterval(() => {
      mermaidApi.init(undefined, document.getElementsByClassName(MERMAID));
    }, 200);
  }

  const template = config.useCustomElement ?
    (value: string) => `<${MermaidElement.is} class="${MERMAID}">${value}</${MermaidElement.is}>` :
    (value: string) => `<div class="${MERMAID}">${value}</div>`;

  return function transformer(tree: MDAST.Root) {
    return visit(tree, 'code', (node: any) => {
      const lang = (node.lang || '').toLowerCase();
      if (lang === MERMAID) {
        node.type = 'html';
        node.value = template(node.value);
      }
      return true;
    });
  };
}

if (supportsCustomElements) {
  try {
    customElements.define(MermaidElement.is, MermaidElement);
  } catch (err) {
    // noop
  }
}
