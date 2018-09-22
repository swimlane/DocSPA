import VFile from 'vfile';
import { Location } from '@angular/common';

/**
 * Given 2 parts of a url, join them with a slash if needed.
 * TODO: Accept multiple args
 */
export const join = Location.joinWithSlash;

export function getBasePath(vfile: VFile) {
  return vfile.history[0];
}

export function getFullPath(vfile: VFile) {
  return join(vfile.cwd, vfile.path);
}

export function splitHash(hash: string) {
  const arr = [hash, ''];
  const idx = hash.indexOf('#', 1);
  if (idx > 0) {
    arr[0] = hash.slice(0, idx);
    arr[1] = hash.slice(idx);
  }
  return arr;
}
