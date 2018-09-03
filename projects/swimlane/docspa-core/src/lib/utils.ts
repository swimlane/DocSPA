import VFile from 'vfile';
import path from 'path';

export function getBasePath(vfile: VFile) {
  return vfile.history[0];
}

export function getFullPath(vfile: VFile) {
  return path.join(vfile.cwd, vfile.path);
}
