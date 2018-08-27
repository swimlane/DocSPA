import { Injectable, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import VFile from 'vfile';

import path from 'path';
import urlResolve from 'url-resolve';

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
    return path.join(this.settings.nameLink, this.settings.basePath);
  }

  get basePath() {
    return this.settings.basePath;
  }

  get ext() {
    return this.settings.ext;
  }

  constructor(
    private location: Location,
    private settings: SettingsService
  ) {
  }

  /**
   * Convert a page string to a virtual file
   */
  pageToFile(page: string = ''): VFile {
    page = page.replace(/^#/, '');
    if (page === '') {
      page = '/';
    }

    const vfile = new VFile({ path: page, cwd: this.root });

    /* if (vfile.path[0] === '/' && vfile.path[1] === '_') {
      vfile.path = this.settings.notFoundPage;
    } */

    if (vfile.path.slice(-1) === '/') {
      vfile.path = path.join(vfile.path, this.settings.homepage);
    }

    if (vfile.basename === '') {
      vfile.basename = this.settings.homepage;
    }
    if (vfile.extname === '') {
      vfile.extname = this.settings.ext;
    }

    return vfile;
  }

  /**
   * Return a resolved url relative to the base path
   */
  prepareLink(href: string, base: string = '') {
    return LocationService.isAbsolutePath(href) ?
      href :
      this.location.prepareExternalUrl(urlResolve(base, href));
  }

  /**
   * Return a resolved url relative to the base path
   */
  prepareSrc(src: string, base: string = '') {
    // TODO: make static
    return LocationService.isAbsolutePath(src) ?
      src :
      urlResolve(base, src);
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
