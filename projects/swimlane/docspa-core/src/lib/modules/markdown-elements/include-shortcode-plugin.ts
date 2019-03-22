import UNIFIED from 'unified';
import VFILE from 'vfile';
import visit from 'unist-util-visit';
import MDAST from 'mdast';

import { resolve } from 'url';

function join(start: string, end: string): string {
  if (start.length === 0) {
    return end;
  }
  if (end.length === 0) {
    return start;
  }
  let slashes = 0;
  if (start.endsWith('/')) {
    slashes++;
  }
  if (end.startsWith('/')) {
    slashes++;
  }
  if (slashes === 2) {
    return start + end.substring(1);
  }
  if (slashes === 1) {
    return start + end;
  }
  return start + '/' + end;
}

interface ShortCode extends MDAST.Parent {
  type: 'shortcode';
  identifier: string;
  attributes: { [key: string]: any };
}

export function includeShortCode(this: UNIFIED.Processor): UNIFIED.Transformer {
  const processor = this;
  return async (tree: MDAST.Root, file: VFILE.VFile) => {
    file.data = file.data || {};
    const promises: any[] = [];
    visit(tree, 'shortcode', visitor);
    return await Promise.all(promises).then(() => tree);

    function visitor(node: ShortCode, index: number, parent: MDAST.Parent) {
      if (node.identifier === 'include' && node.attributes.path) {
        const filePath = join(file.cwd, resolve(file.path as string, node.attributes.path));
        const p = fetch(filePath).then(res => res.text()).then(res => {
          let newNode: any;

          if (node.attributes.codeblock) {
            newNode = {
              type: 'code',
              data: node.data,
              value: res,
              lang: node.attributes.codeblock
            };
          } else {
            newNode = {
              type: 'embededBlock',
              data: node.data,
              children: processor.parse(res).children
            };
          }
          parent.children.splice(index, 1, newNode);
        });
        promises.push(p);
      }
      return true;
    }
  };
}
