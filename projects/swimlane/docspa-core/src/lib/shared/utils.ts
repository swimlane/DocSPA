/**
 * Given 2 parts of a url, join them with a slash if needed.
 * TODO: Accept multiple args
 */
export function join(start: string, end: string): string {
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

export function splitHash(hash: string = '') {
  const arr = [hash, ''];
  if (!hash) { return arr; }
  const idx = hash.indexOf('#', 1);
  if (idx > 0) {
    arr[0] = hash.slice(0, idx);
    arr[1] = hash.slice(idx);
  }
  return arr;
}

export function goExternal(url: string) {
  window.location.assign(url);
}

export function isDirname(href: string, page: string) {
  return href[href.indexOf(page) + page.length] === '/';
}

export function isAbsolutePath(_: string) {
  return new RegExp('(:|(\/{2}))', 'g').test(_);
}

export function stripBaseHref(baseHref: string, url: string): string {
  return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}

export function stripIndexHtml(url: string) {
  return url.replace(/\/index.html$/, '');
}
