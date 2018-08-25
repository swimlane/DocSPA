import visit from 'unist-util-visit';

/**
 * Convert [[toc]] smart-code to a TOC
 * Must be included after remark-shortcodes
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
        const newNode = {
          type: node.identifier,
          data: {
            hChildren: [
              {
                type: 'element',
                tagName: codes[node.identifier],
                properties: {
                  ...node.data.hProperties
                }
              }
            ]
          }
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
  toc: 'md-toc',
  include: 'md-embed',
  var: 'env-var',
  stackblitz: 'embed-stackblitz'
};
