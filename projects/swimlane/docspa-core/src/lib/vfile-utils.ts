import { VFile } from 'vfile';
import { join } from './utils';

export function getBasePath(vfile: VFile) {
  return vfile.history[0];
}

export function getFullPath(vfile: VFile) {
  return join(vfile.cwd, vfile.path);
}
