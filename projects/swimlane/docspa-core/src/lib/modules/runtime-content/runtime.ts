import visit from 'unist-util-visit';
import VFILE from 'vfile';
import * as MDAST from 'mdast';
import * as UNIFIED from 'unified';

interface VNode {
  node: MDAST.Code;
  index: number | undefined;
  parent: any;
}

export function runtime(this: UNIFIED.Processor): UNIFIED.Transformer {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor = this;

  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(tree: MDAST.Root, file: VFILE.VFile, next: Function): any {
    const items: VNode[] = [];

    visit(tree, 'code', (node: MDAST.Code, index: number, parent: MDAST.Parent) => {
      items.push({node, index, parent});
      return true;
    });

    const res = items.map(({node, index, parent}) => {
      return visitor(node, index, parent);
    });

    return Promise.all(res).then(() => {
      next();
    });

    async function visitor(node: MDAST.Code, index: number, parent: MDAST.Parent) {
      const { lang, data } = node;


      if (!data || !data.hProperties) {
        return;
      }

      let { value } = node;
      const { hProperties } = data as any;

      const isPlayground = 'playground' in hProperties;
      const isRun = 'run' in hProperties;

      if (isRun || isPlayground) {
        const type = isPlayground ? 'playgroundCustomBlock' : 'runtimeCustomBlock';

        hProperties.class = hProperties.class || [];
        hProperties.class.push('custom-block');
        hProperties.class.push(isPlayground ? 'playground' : 'runtime');
        if (lang === 'markdown') {
          const f = VFILE({ ...file, contents: node.value });
          const v = await processor.process(f as any);
          value = String(v.contents);
        } else {
          const context = {
            $page: file.data || {}
          };
          try {
            Object.assign(context, JSON.parse(hProperties.context));
          } catch (e) {
            // no-op
          }
          value = `<template is="runtime-element"
            template="${escape(value, true)}"
            context="${escape(JSON.stringify(context), true)}">
          </template>`;
        }

        const newNode = {
          type,
          data: { hProperties },
          children: [
            {
              type: 'html',
              value
            }
          ]
        };

        if (isPlayground) {
          newNode.children = newNode.children.concat([
            {
              type: 'html',
              value: '<br />'
            },
            {
              type: 'html',
              value: '<details>'
            },
            {
              type: 'html',
              value: '<summary>'
            },
            {
              type: 'text',
              value: `Show ${lang}...`
            },
            {
              type: 'html',
              value: '</summary>'
            },
            node,
            {
              type: 'html',
              value: '</details>'
            }
          ]);
        }

        parent.children.splice(index, 1, newNode as MDAST.Content);
        return node;
      }
    }
  };
}

function escape(html: string, encode: boolean) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
