/**
 * Copy of https://github.com/zestedesavoir/zmarkdown/blob/master/packages/remark-custom-blocks/src/index.js
 * Updated to allow multiple versions
 */

import spaceSeparated from 'space-separated-tokens';

function escapeRegExp (str: string) {
  return str.replace(/[-[]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

const C_NEWLINE = '\n';
const C_FENCE = '|';

let nextId = 0;

function compilerFactory (nodeType) {
  let text;
  let title;

  return {
    blockHeading (node: any) {
      title = (this as any).all(node).join('');
      return '';
    },
    blockBody (node: any) {
      text = (this as any).all(node).map(s => s.replace(/\n/g, '\n| ')).join('\n|\n| ');
      return text;
    },
    block (node: any) {
      text = '';
      title = '';
      (this as any).all(node);
      if (title) {
        return `[[${nodeType} | ${title}]]\n| ${text}`;
      } else {
        return `[[${nodeType}]]\n| ${text}`;
      }
    },
  };
}

export default function blockPlugin (this: any, availableBlocks = {}) {
  const pattern = Object
    .keys(availableBlocks)
    .map(escapeRegExp)
    .join('|');

  if (!pattern) {
    throw new Error('remark-custom-blocks needs to be passed a configuration object as option');
  }

  const regex = new RegExp(`\\[\\[(${pattern})(?: *\\| *(.*))?\\]\\]\n`);

  function blockTokenizer (this: any, eat, value, silent) {
    const now = eat.now();
    const keep = regex.exec(value);
    if (!keep) { return; }
    if (keep.index !== 0) { return; }
    const [eaten, blockType, blockTitle] = keep;

    /* istanbul ignore if - never used (yet) */
    if (silent) { return true; }

    const linesToEat: any[] = [];
    const content: any[] = [];

    let idx = 0;
    while ((idx = value.indexOf(C_NEWLINE)) !== -1) {
      const next = value.indexOf(C_NEWLINE, idx + 1);
      // either slice until next NEWLINE or slice until end of string
      const lineToEat: string = next !== -1 ? value.slice(idx + 1, next) : value.slice(idx + 1);
      if (lineToEat[0] !== C_FENCE) { break; }
      // remove leading `FENCE ` or leading `FENCE`
      const line = lineToEat.slice(lineToEat.startsWith(`${C_FENCE} `) ? 2 : 1);
      linesToEat.push(lineToEat);
      content.push(line);
      value = value.slice(idx + 1);
    }

    const contentString = content.join(C_NEWLINE);

    const stringToEat = eaten + linesToEat.join(C_NEWLINE);

    const potentialBlock = availableBlocks[blockType];
    const titleAllowed = potentialBlock.title &&
      (['optional', 'required'] as any).includes(potentialBlock.title);
    const titleRequired = potentialBlock.title && potentialBlock.title === 'required';

    if (titleRequired && !blockTitle) { return; }
    if (!titleAllowed && blockTitle) { return; }

    const add = eat(stringToEat);

    const exit = this.enterBlock();
    const contents = {
      type: `${blockType}CustomBlockBody`,
      data: {
        hName: 'div',
        hProperties: {
          className: 'custom-block-body',
        },
      },
      children: (this as any).tokenizeBlock(contentString, now),
    };
    exit();

    const blockChildren = [contents];
    if (titleAllowed && blockTitle) {
      const titleNode = {
        type: `${blockType}CustomBlockHeading`,
        data: {
          hName: potentialBlock.details ? 'summary' : 'div',
          hProperties: {
            className: 'custom-block-heading',
          },
        },
        children: (this as any).tokenizeInline(blockTitle, now),
      };

      blockChildren.unshift(titleNode);
    }

    const classList = spaceSeparated.parse(potentialBlock.classes || '');

    return add({
      type: `${blockType}CustomBlock`,
      children: blockChildren,
      data: {
        hName: potentialBlock.details ? 'details' : 'div',
        hProperties: {
          className: ['custom-block', ...classList],
        },
      },
    });
  }

  const Parser = (this as any).Parser;

  const id = `customBlocks${nextId++}`;

  // Inject blockTokenizer
  const blockTokenizers = Parser.prototype.blockTokenizers;
  const blockMethods = Parser.prototype.blockMethods;
  blockTokenizers[id] = blockTokenizer;
  blockMethods.splice(blockMethods.indexOf('fencedCode') + 1, 0, id);
  const Compiler = (this as any).Compiler;
  if (Compiler) {
    const visitors = Compiler.prototype.visitors;
    if (!visitors) { return; }
    Object.keys(availableBlocks).forEach(key => {
      const compiler = compilerFactory(key);
      visitors[`${key}CustomBlock`] = compiler.block;
      visitors[`${key}CustomBlockHeading`] = compiler.blockHeading;
      visitors[`${key}CustomBlockBody`] = compiler.blockBody;
    });
  }
  // Inject into interrupt rules
  const interruptParagraph = Parser.prototype.interruptParagraph;
  const interruptList = Parser.prototype.interruptList;
  const interruptBlockquote = Parser.prototype.interruptBlockquote;
  interruptParagraph.splice(interruptParagraph.indexOf('fencedCode') + 1, 0, [id]);
  interruptList.splice(interruptList.indexOf('fencedCode') + 1, 0, [id]);
  interruptBlockquote.splice(interruptBlockquote.indexOf('fencedCode') + 1, 0, [id]);
}
