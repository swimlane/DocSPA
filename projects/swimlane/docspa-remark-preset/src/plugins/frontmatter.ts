import visit from 'unist-util-visit';
import toString from 'mdast-util-to-string';
import * as MDAST from 'mdast';
import * as VFILE from 'vfile';
import * as UNIFIED from 'unified';
import { Transformer, Attacher, Settings } from 'unified';

interface VFile extends VFILE.VFile {
  data: {
    matter?: any;
    title?: string;
  };
}

export function readMatter(): Transformer {
  return function transformer(node: MDAST.Root, file: VFile) {
    if (node.children[0].type === 'yaml') {
      node.children[0].data = node.children[0].data || {};
      file.data.matter = node.children[0].data.parsedValue;
    }
    return node;
  };
}

export function getTitle(): Transformer {
  return (tree: MDAST.Root, file: VFile) => {
    file.data = file.data || {};
    return visit(tree, 'heading', (node: MDAST.Heading) => {
      if (node.depth === 1 && !file.data.title) {
        file.data.title = toString(node);
      }
      return true;
    });
  };
}
