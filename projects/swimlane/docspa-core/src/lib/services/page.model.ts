///<reference path="../../vendor.d.ts"/>

import VFile from 'vfile';
import path from 'path';

// todo: rename VPage
export class Page extends VFile {
  // todo: move to data
  timestampCached: number;
  notFound: boolean;

  resolvedPath: string;

  text?: string;
  html?: string;

  get fullpath() {
    return path.join(this.cwd, this.path);
  }

  get base() {
    return this.history[0];
  }

  constructor(options: any = {}) {
    super(options);
  }
}

