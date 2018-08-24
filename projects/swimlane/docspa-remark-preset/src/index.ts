import headings from '@rigor789/remark-autolink-headings';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import katex from 'remark-html-katex';
import gemojiToEmoji from 'remark-gemoji-to-emoji';
import htmlEmojiImage from 'remark-html-emoji-image';
import parseFrontmatter from 'remark-parse-yaml';
import shortcodes from 'remark-shortcodes';
import slug from 'remark-slug';
import remarkAttr from 'remark-attr';

import { readMatter, getTitle } from './plugins/frontmatter';

import { infoString, infoStringToAttr, customBlocks } from './plugins/misc';
import { customBlockquotes } from './plugins/remark-custom-blockquotes';
import { smartCodeProps, tocSmartCode } from './plugins/smart-codes';
import { mermaid } from './plugins/mermaid';

export const docspaRemarkPreset = [
  frontmatter,
  parseFrontmatter,
  readMatter,
  getTitle,
  infoString,
  [ remarkAttr, { scope: 'permissive' } ],
  slug,
  [ headings, { behaviour: 'append' } ],
  math,
  katex,
  gemojiToEmoji,
  [ htmlEmojiImage, { base: 'https://assets-cdn.github.com/images/icons/emoji/' }],
  infoStringToAttr,
  customBlocks,
  customBlockquotes,
  // runtime,
  mermaid,
  shortcodes,
  smartCodeProps,
  tocSmartCode
];
