import visit from 'unist-util-visit';
import toString from 'mdast-util-to-string';
import MDAST from 'mdast';
import VFILE from 'vfile';

interface VFile extends VFILE.VFile {
  data: {
    matter?: any;
    title?: string;
  };
}

export function readMatter() {
  return function transformer({children}: MDAST.Root, file: VFile) {
    if (children[0].type === 'yaml') {
      file.data.matter = children[0].data.parsedValue;
    }
  };
}

export const getTitle = () => {
  return (tree: MDAST.Root, file: VFile) => {
    file.data = file.data || {};
    return visit(tree, 'heading', (node: MDAST.Heading) => {
      if (node.depth === 1 && !file.data.title) {
        file.data.title = toString(node);
      }
      return true;
    });
  };
};
