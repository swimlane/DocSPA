import visit from 'unist-util-visit';
import { Root, Parent } from 'mdast';
import { VFile } from 'vfile';
import { Transformer } from 'unified';

export function shortCodeProps(): Transformer {
  return (tree: Root, file: VFile) => {
    file.data = file.data || {};
    return visit(tree, 'shortcode', (node: Parent) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties = { ...(node.data.hProperties as any), ...(node.attributes as any) };
      return true;
    });
  };
}
