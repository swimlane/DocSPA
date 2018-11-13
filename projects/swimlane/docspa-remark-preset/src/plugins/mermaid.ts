import visit from 'unist-util-visit';
import mermaidApi from 'mermaid';

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

export function mermaid(options) {
  const config = {
    startOnLoad: false,
    arrowMarkerAbsolute: false,
    theme: 'default',
    useCustomElement: supportsCustomElements,
    ...options
  };

  const useCustomElement = supportsCustomElements && config.useCustomElement;

  mermaidApi.initialize(config);

  if (!useCustomElement) {
    // Fallback: look for unprocessed mermaid elements on a timer.
    setInterval(() => {
      mermaidApi.init(undefined, document.getElementsByClassName(MERMAID));
    }, 200);
  }

  const template = useCustomElement ?
    value => `<${MermaidElement.is}>${value}</${MermaidElement.is}>` :
    value => `<div class="${MERMAID}">${value}</div>`;

  return function transformer(tree) {
    visit(tree, 'code', (node: any) => {
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
  customElements.define(MermaidElement.is, MermaidElement);
}
