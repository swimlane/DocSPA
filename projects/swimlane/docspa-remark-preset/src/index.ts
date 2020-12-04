import headings from '@rigor789/remark-autolink-headings';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import katex from 'remark-html-katex';
import gemojiToEmoji from 'remark-gemoji-to-emoji';
import parseFrontmatter from 'remark-parse-yaml';
import shortcodes from 'remark-shortcodes';
import slug from 'remark-slug';
import remarkAttr from 'remark-attr';
import reporter from 'vfile-reporter';
import sectionize from 'remark-sectionize';

import customBlocks from './plugins/remark-custom-blocks-plugin';

import { readMatter, getTitle } from './plugins/frontmatter';
import { infoString, infoStringToAttr } from './plugins/misc';
import { customBlocksOptions } from './plugins/remark-custom-blocks';
import { customBlockquotes, customBlockquotesOptions } from './plugins/remark-custom-blockquotes';
import { shortCodeProps } from './plugins/short-codes';
import { prism } from './plugins/prism';
import { mermaid } from './plugins/mermaid';

import visit from 'unist-util-visit';
import { Root } from 'mdast';
import { VFile } from 'vfile';
import { Transformer } from 'unified';

export { customBlocks, customBlockquotes, prism, mermaid, reporter, getTitle };

export function moveIds(): Transformer {
  return (tree: Root, file: VFile) => {
    return visit(tree, 'heading', (node: any, index: number, parent: any) => {
      if (parent.type === 'section' && node.data && node.data.hProperties && node.data.hProperties.id) {
        parent.data = parent.data || Object.create(null);
        parent.data.hProperties = parent.data.hProperties || Object.create(null);
        parent.data.hProperties.id = node.data.hProperties.id;
        delete node.data.hProperties.id;
      }
      return true;
    });
  };
}

export const plugins = [
  frontmatter,
  parseFrontmatter,
  readMatter,
  getTitle,
  infoString,
  [ remarkAttr, { scope: 'permissive' } ],
  slug,
  [ headings, { behaviour: 'append' } ],
  sectionize,
  moveIds,
  math,
  katex,
  gemojiToEmoji,
  infoStringToAttr,
  [ customBlocks, customBlocksOptions ],
  [ customBlockquotes, customBlockquotesOptions ],
  shortcodes,
  shortCodeProps,
  mermaid,
  prism
];

export const settings = {};

export const preset = {
  settings,
  plugins,
  reporter
};

export default preset;
