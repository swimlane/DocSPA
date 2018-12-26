import { Injectable } from '@angular/core';
import VFILE, { default as VFile } from 'vfile';

import { join } from '../utils';
import { resolve } from 'url';

import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  /**
   * Determines if a string is an absolut URL
   */
  static isAbsolutePath(_: string) {
    return new RegExp('(:|(\/{2}))', 'g').test(_);
  }

  get root() {
    return this.settings.root;
  }

  get basePath() {
    return this.settings.basePath;
  }

  get ext() {
    return this.settings.ext;
  }

  constructor(
    private settings: SettingsService
  ) {
  }

  /**
   * Convert a page string to a virtual file
   */
  pageToFile(page: string = ''): VFILE.VFile {
    page = page.replace(/^#/, '');
    if (page === '') {
      page = '/';
    }

    const vfile = VFile({ path: page, cwd: this.root });

    /* if (vfile.path[0] === '/' && vfile.path[1] === '_') {
      vfile.path = this.settings.notFoundPage;
    } */

    if (vfile.path.slice(-1) === '/') {
      vfile.path = join(vfile.path, this.settings.homepage);
    }

    if (vfile.basename === '') {
      vfile.basename = this.settings.homepage;
    }
    if (vfile.extname === '') {
      vfile.extname = this.settings.ext;
    }

    vfile.data = {
      docspa: {
        url: join(vfile.cwd, vfile.path)
      }
    };

    return vfile;
  }

  /**
   * Return a resolved url relative to the base path
   */
  prepareLink(href: string, base: string = '') {
    return LocationService.isAbsolutePath(href) ?
      href :
      resolve(base, href);
  }

  /**
   * Return a resolved url relative to the base path
   */
  prepareSrc(src: string, base: string = '') {
    return LocationService.isAbsolutePath(src) ?
      src :
      join(this.basePath, resolve(base, src));
  }

  /**
   * Removes the base HREF from a url
   */
  stripBaseHref(url: string): string {
    if (!url) {
      return null;
    }
    const basePath = this.basePath;
    return basePath && url.startsWith(basePath) ? url.substring(basePath.length) : url;
  }
}
