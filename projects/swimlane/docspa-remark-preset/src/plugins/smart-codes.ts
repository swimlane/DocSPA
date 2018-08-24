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
        const newNode = {
          type: 'toc',
          data: {
            hChildren: [
              {
                type: 'element',
                tagName: 'md-toc',
                properties: {
                  path: file.data.base,
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

export const smartCodeProps = () => {
  return (tree, file) => {
    file.data = file.data || {};
    visit(tree, 'shortcode', (node, index, parent) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties = { ...node.data.hProperties, ...node.attributes };
    });
  };
};
