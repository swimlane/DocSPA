import { Injectable, EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { NGXLogger } from 'ngx-logger';
import { ReplaySubject } from 'rxjs';

import { getFullPath } from '../utils';

import { SettingsService } from './settings.service';
import { FetchService } from './fetch.service';
import { LocationService } from './location.service';

import { VFile } from 'vfile';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  homepage: string;
  loadNavbar: string;
  loadSidebar: string;
  coverpage: string;

  url: string;
  page: string;
  anchor: string;
  file: string;

  contentPage: string;

  /* coverPath: string;
  sidebarPath: string;
  navbarPath: string;
  rightSidebarPath: string; */

  changed = new EventEmitter<SimpleChanges>();

  private readonly urlParser = document.createElement('a');
  private urlSubject = new ReplaySubject<string>(1);

  /**
   * Get the current url from the window location
   * Note: cannot use Location directly at the moment as it drops traling slashes
   */
  private get locationPath() {
    const { pathname, hash } = window.location;
    let url = this.location.path(false);
    if (this.isDirname(pathname, url) && url.slice(-1) !== '/') {
      url += '/';
    }
    return url + hash;
  }

  clickHandler = event => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.shiftKey ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey
    ) {
      return;
    }

    let anchor = event.target;
    while (anchor && anchor.nodeName.toLowerCase() !== 'a') {
      anchor = anchor.parentNode;
    }

    if (
      !anchor ||
      anchor.nodeName.toLowerCase() !== 'a' ||
      anchor.target && anchor.target.toLowerCase() !== '_self' ||
      anchor.hasAttribute('download') ||
      anchor.hasAttribute('ignore')) {
      return;
    }

    const href = anchor.getAttribute('href');

    if (!href || LocationService.isAbsolutePath(href)) {
      return;
    }

    event.preventDefault();
    this.go(href);
  }

  constructor(
    private location: Location,
    private settings: SettingsService,
    private fetchService: FetchService,
    private locationService: LocationService,
    private logger: NGXLogger
  ) {
    location.subscribe((state: PopStateEvent) => {
      if (state.type === 'hashchange' || state.type === 'popstate') {
        return this.urlSubject.next(this.locationPath || '');
      }
    });

    // TODO: move this.... could be in the docspa-page
    this.urlSubject.subscribe(path => {
      this.hashchange(path || '/');
    });
  }

  onInit() {
    this.urlSubject.next(this.locationPath || '');
  }

  go(url: string = '/') {
    if (!url) { return; }
    if (LocationService.isAbsolutePath(url)) {
      this.goExternal(url);
    } else {
      this.location.go(url);
      this.urlSubject.next(url);
    }
  }

  private goExternal(url: string) {
    window.location.assign(url);
  }

  private isDirname(href: string, page: string) {
    return href[href.indexOf(page) + page.length] === '/';
  }

  private async hashchange(url: string = '/') {
    const changes: SimpleChanges = {};

    this.logger.debug(`location changed: ${url}`);

    if (this.url !== url) {
      changes.url = new SimpleChange(this.url, this.url = url, false);
    }

    let [page = '/', anchor = ''] = url.split(/[#\?]/);
    anchor = anchor || '';
    page = page || '/';

    this.logger.debug(`page: ${page}`);
    this.logger.debug(`anchor: ${anchor}`);

    const vfile = this.locationService.pageToFile(page);

    if (anchor.includes('id=')) {
      const params = new URLSearchParams(anchor);
      anchor = params.get('id');
    }
    if (this.anchor !== anchor) {
      changes.anchor = new SimpleChange(this.anchor, this.anchor = anchor, false);
    }

    if (this.contentPage !== page) {
      changes.contentPage = new SimpleChange(this.contentPage, this.contentPage = page, false);

      const [coverPage, sideLoads] = await Promise.all([
        this.resolveCoverPath(vfile),
        this.resolveSideloadPaths(vfile)
      ]);

      changes.coverPage = new SimpleChange(null, coverPage, false);
      changes.sideLoad = new SimpleChange(null, sideLoads, false);
    }

    if (Object.keys(changes).length > 0) {
      this.changed.emit(changes);
    }
  }

  private async resolveCoverPath(vfile: VFile) {
    const path = vfile.basename === this.settings.homepage ?
      await this.fetchService.find(getFullPath(vfile), this.settings.coverpage) :
      null;
    return this.locationService.stripBaseHref(path);
  }

  private async resolveSideloadPaths(vfile: VFile) {
    const sideLoad = this.settings.sideLoad;
    const keys = Object.keys(sideLoad);

    const promises = keys.map(key => {
      return this.fetchService.findup(vfile.cwd, vfile.path, sideLoad[key]);
    });

    const sideLoadPathsArr = await Promise.all(promises);

    return sideLoadPathsArr.reduce((acc: {[key: string]: string}, path: any, idx: number) => {
      const key = keys[idx];
      acc[key] = this.locationService.stripBaseHref(path);
      return acc;
    }, {} as {[key: string]: string});
  }
}
