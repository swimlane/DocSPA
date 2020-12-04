import toc from 'mdast-util-toc';
import visit from 'unist-util-visit';

import type * as mdast from 'mdast';

import type { TOCOptions, VFile } from '../../../shared/vfile';

export function tocPlugin(options?: TOCOptions) {
  return (tree: mdast.Root, vfile: VFile) => {
    const _options = {
      ...options,
      ...(vfile.data?.tocOptions || {})
    };

    const result = toc(tree, _options);

    tree.children = [].concat(
      tree.children.slice(0, result.index),
      result.map || []
    );

    return visit(tree, 'listItem', (node: any, index: number, parent: any) => {
      if (node.children.length > 1) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties.class = node.data.hProperties.class || [];
        node.data.hProperties.class.push('has-children');
      }
      return true;
    });
  };
}
