import { Injectable } from '@angular/core';
import { LocationStrategy, PlatformLocation } from '@angular/common';
import { resolve } from 'url';

import { join, isAbsolutePath, stripBaseHref  } from '../shared/utils';

import { SettingsService } from './settings.service';

import { VFile } from '../shared/vfile';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  get basePath() {
    return this.settings.basePath;
  }

  get ext() {
    return this.settings.ext;
  }

  private baseHref: string;

  constructor(
    private settings: SettingsService,
    private platformStrategy: LocationStrategy
  ) {
    this.baseHref = this.platformStrategy.getBaseHref();
  }

  /**
   * Convert a page string to a virtual file
   */
  pageToFile(page: string = ''): VFile {
    page = page.replace(/^#/, '');
    if (page === '') {
      page = '/';
    }

    const vfile = VFile({ path: page, cwd: this.basePath });

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
    if (isAbsolutePath(href)) { return href; }
    return resolve(base, stripBaseHref(this.baseHref, href));
  }

  /**
   * Return a resolved url relative to the base path
   */
  prepareSrc(src: string, base: string = '') {
    if (isAbsolutePath(src)) { return src; }
    return join(this.basePath, resolve(base, src));
  }

  /**
   * Removes the base path from a url
   */
  stripBasePath(url: string): string {
    if (!url) { return null; }
    return stripBaseHref(this.basePath, url);
  }
}
