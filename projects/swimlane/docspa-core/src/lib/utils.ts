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
