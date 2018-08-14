import headings from '@rigor789/remark-autolink-headings';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import katex from 'remark-html-katex';
import gemojiToEmoji from 'remark-gemoji-to-emoji';
import htmlEmojiImage from 'remark-html-emoji-image';
import parseFrontmatter from 'remark-parse-yaml';
import remarkAttr from 'remark-attr';
import shortcodes from 'remark-shortcodes';
import slug from 'remark-slug';

import { infoString, infoStringToAttr, customBlocks, tabsHook } from './misc';
import { customBlockquotes } from './remark-custom-blockquotes';
import { runtime } from './runtime';
import { tocSmartCode } from './smart-codes';
import { readMatter, getTitle } from './frontmatter';

export * from './mermaid';
export * from './prisim';

export const defaultRemarkPlugins = [
  frontmatter,
  parseFrontmatter,
  readMatter,
  infoString,
  customBlockquotes,
  [remarkAttr, { scope: 'permissive' }],
  slug,
  [ headings, { behaviour: 'append' } ],
  math,
  katex,
  gemojiToEmoji,
  [htmlEmojiImage, { base: 'https://assets-cdn.github.com/images/icons/emoji/' }],
  infoStringToAttr,
  customBlocks,
  runtime,
  getTitle,
  shortcodes,
  tocSmartCode
];

export {
  readMatter, infoString, infoStringToAttr, customBlocks,
  customBlockquotes, slug, runtime, tabsHook,
  getTitle, tocSmartCode
};
