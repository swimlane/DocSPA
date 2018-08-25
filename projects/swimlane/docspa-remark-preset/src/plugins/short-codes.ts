import visit from 'unist-util-visit';

/**
 * Convert [[toc]] smart-code to a TOC
 * Must be included after remark-shortcodes but before customSmartCodes
 */
export const tocSmartCode = () => {
  return (tree, file) => {
    file.data = file.data || {};
    visit(tree, 'shortcode', (node, index, parent) => {
      if (node.identifier === 'toc') {
        node.attributes.path = node.attributes.path || file.data.base;
      }
    });
  };
};

export const customSmartCodes = (codes) => {
  return (tree, file) => {
    file.data = file.data || {};
    visit(tree, 'shortcode', (node, index, parent) => {
      if (node.identifier in codes) {
        const child = {
          type: 'element',
          ...codes[node.identifier]
        };
        child.properties = {...(child.properties || {}), ...node.data.hProperties };
        const newNode = {
          type: node.identifier,
          data: { hChildren: [child] }
        };
        parent.children.splice(index, 1, newNode);
      }
    });
  };
};

export const shortCodeProps = () => {
  return (tree, file) => {
    file.data = file.data || {};
    visit(tree, 'shortcode', (node, index, parent) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties = { ...node.data.hProperties, ...node.attributes };
    });
  };
};

export const customSmartCodesOptions = {
  toc: {
    tagName: 'md-toc'
  },
  include: {
    tagName: 'md-embed'
  },
  var: {
    tagName: 'env-var'
  },
  stackblitz: {
    tagName: 'embed-stackblitz'
  }
};
