import visit from 'unist-util-visit';

import type * as mdast from 'mdast';

import type { TOCOptions, VFile } from '../../../shared/vfile';

export function removeNodesPlugin(options?: TOCOptions) {
  return (tree: mdast.Root, vfile: VFile) => {
    const _options = {
      ...options,
      ...(vfile.data?.tocOptions || {})
    };
    const minDepth = _options?.minDepth || 1;

    return visit(tree, 'heading', (node: mdast.Heading, index: number, parent: any) => {
      if (node.depth < minDepth) {
        parent.children.splice(index, 1);
      }
      return true;
    });
  };
}
