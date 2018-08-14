import { Injectable, EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common';
import { URLSearchParams } from '@angular/http';

import * as path from 'path';

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

  contentPath: string;
  coverPath: string;
  sidebarPath: string;
  navbarPath: string;
  rightSidebarPath: string;

  changed = new EventEmitter<SimpleChanges>();

  constructor(
    location: Location,
    private settings: SettingsService,
    private fetchService: FetchService,
    private locationService: LocationService
  ) {
    location.subscribe(v => {
      if (v.type === 'hashchange') {
        this.hashchange();
      }
    });
  }

  onInit() {
    this.hashchange();
  }

  private hashchange() {
    const changes: SimpleChanges = {};
    const url = window.location.hash || '#' + this.settings.homepage;

    if (this.url !== url) {
      changes.url = new SimpleChange(this.url, this.url = url, false);
    }

    const [, _page, _anchor = ''] = url.split(/[#\?]/);
    let anchor = _anchor || '';

    const vfile = this.locationService.pageToFile(_page);

    if (this.page !== vfile.stem) {
      changes.page = new SimpleChange(this.page, this.page = vfile.stem, false);
    }

    if (this.file !== vfile.path) {
      changes.file = new SimpleChange(this.file, this.file = vfile.path, false);
    }

    if (anchor.includes('id=')) {
      const params = new URLSearchParams(anchor);
      anchor = params.get('id');
    }
    if (this.anchor !== anchor) {
      changes.anchor = new SimpleChange(this.anchor, this.anchor = anchor, false);
    }

    const contentPath = vfile.fullpath;
    if (this.contentPath !== contentPath) {
      changes.contentPage = new SimpleChange(null, this.file, false);
      changes.contentPath = new SimpleChange(this.contentPath, this.contentPath = contentPath, false);

      const cover = vfile.basename === this.settings.homepage ?
        this.fetchService.find(path.join(vfile.cwd, vfile.dirname), this.settings.coverpage) :
        null;

      const promises = this.settings.sideLoad.map(s => {
        return this.fetchService.findup(path.join(vfile.cwd, vfile.dirname), s);
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
