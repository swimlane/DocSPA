import { Injectable, EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { URLSearchParams } from '@angular/http';
import { NGXLogger } from 'ngx-logger';

import { getFullPath } from '../utils';

import { SettingsService } from './settings.service';
import { FetchService } from './fetch.service';
import { LocationService } from './location.service';

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

  coverPath: string;
  sidebarPath: string;
  navbarPath: string;
  rightSidebarPath: string;

  changed = new EventEmitter<SimpleChanges>();

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
      anchor.hasAttribute('download')) {
      return;
    }

    event.preventDefault();
    this.go(anchor.getAttribute('href'));
  }

  constructor(
    private location: Location,
    private settings: SettingsService,
    private fetchService: FetchService,
    private locationService: LocationService,
    private logger: NGXLogger
  ) {
    location.subscribe((v: PopStateEvent) => {
      if (v.type === 'hashchange') {
        this.hashchange(v.url);
      }
    });
  }

  onInit() {
    this.hashchange(this.location.path(true) || '/');
  }

  go(url: string = '/') {
    this.location.go(url);
    this.hashchange(this.location.path(true) || '/');
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

    // If the current URL end in a slash, the page is a directory, not a file.
    if (this.isDirname(window.location.href, page) && page.slice(-1) !== '/') {
      page += '/';
    }

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

      const cover = vfile.basename === this.settings.homepage ?
        this.fetchService.find(getFullPath(vfile), this.settings.coverpage) :
        null;

      const promises = this.settings.sideLoad.map(s => {
        return this.fetchService.findup(vfile.cwd, vfile.path, s);
      });

      Promise.all([cover, ...promises]).then(([coverPage, ...sideLoad]) => {
        changes.coverPage = new SimpleChange(null, this.locationService.stripBaseHref(coverPage as any), false);
        changes.sideLoad = new SimpleChange(null, sideLoad.map((x: any) => this.locationService.stripBaseHref(x)), false);
        this.changed.emit(changes);
      });
    }

    if (Object.keys(changes).length > 0) {
      this.changed.emit(changes);
    }
  }
}
