import headings from '@rigor789/remark-autolink-headings';
import frontmatter from 'remark-frontmatter';
import math from 'remark-math';
import katex from 'remark-html-katex';
import gemojiToEmoji from 'remark-gemoji-to-emoji';
import htmlEmojiImage from 'remark-html-emoji-image';
import parseFrontmatter from 'remark-parse-yaml';
import shortcodes from 'remark-shortcodes';
import slug from 'remark-slug';

import { readMatter, getTitle } from './plugins/frontmatter';

import { infoString, infoStringToAttr, customBlocks } from './plugins/misc';
import { customBlockquotes } from './plugins/remark-custom-blockquotes';
// import { runtime } from './plugins/runtime';
import { tocSmartCode } from './plugins/smart-codes';

// todo: smartcode attributes to hProperties

export const docspaRemarkPreset = [
  frontmatter,
  parseFrontmatter,
  readMatter,
  getTitle,
  infoString,
  // [remarkAttr, { scope: 'permissive' }],
  slug,
  [ headings, { behaviour: 'append' } ],
  math,
  katex,
  gemojiToEmoji,
  [htmlEmojiImage, { base: 'https://assets-cdn.github.com/images/icons/emoji/' }],
  infoStringToAttr,
  customBlocks,
  customBlockquotes,
  // runtime,
  shortcodes,
  tocSmartCode
];
