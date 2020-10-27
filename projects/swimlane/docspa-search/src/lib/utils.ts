export function escapeRegexp(str: string) {
  return new RegExp(str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
}

export function highlight(str: string, reQuery: RegExp) {
  return str.replace(reQuery, x => `<em class="search-keyword">${x}</em>`);
}

// TODO: make a config option
const PADDING = 100;

function regexLastIndexOf(str: string, regex: RegExp) {
  let lastIndexOf = -1;
  let result: RegExpExecArray;

  while (result = regex.exec(str)) {
    lastIndexOf = result.index;
  }

  return lastIndexOf;
}

/**
 * Get a region of text surrounding the first oocurance of reQuery
 *
 * @param str string to extract from
 * @param reQuery regexp to find
 * @param len lenth og matcvhing string
 */
export function getExcerpt(str: string, reQuery: RegExp, len: number) {
  const m = reQuery.exec(str);
  if (!m) { return str.slice(0, 2 * PADDING); }

  const { index } = m;
  const s = Math.max(0, index - PADDING);
  const e = index + PADDING;

  const before = str.slice(s, index);
  const after = str.slice(index, e);

  const b = Math.max(0, before.search(/\s+/g) + 1);
  const a = Math.max(len, regexLastIndexOf(after, /\s+/g));

  return before.slice(b) + after.slice(0, a);
}

