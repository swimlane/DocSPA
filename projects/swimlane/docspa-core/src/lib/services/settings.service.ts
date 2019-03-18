import { Injectable, Inject, Optional, forwardRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NGXLogger, NgxLoggerLevel } from 'ngx-logger';

import deepmerge from 'deepmerge'; // use xtend?
import { join } from '../utils';

export interface Theme {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  name = '';
  meta = {};

  homepage = 'README.md';
  sideLoad: {[key: string]: string } = {};

  coverpage = '';
  basePath = 'docs/';
  nameLink = '';
  ext = '.md';
  notFoundPage = '_404.md';
  maxPageCacheSize = 100;

  plugins = [];

  logLevel: number;

  get root() {
    return join(this.nameLink, this.basePath);
  }

  constructor(
    metaService: Meta,
    titleService: Title,
    logger: NGXLogger,
    @Optional() @Inject('environment') environment: any,
    @Optional() @Inject('config') config: any
  ) {
    if (window['$docsify']) {
      this.merge(window['$docsify']);
    }

    if (config) {
      this.merge(config);
    }

    let sideLoad: any = this.sideLoad;

    if (typeof sideLoad !== 'object') { // legacy
      sideLoad = [sideLoad];
    }

    if (Array.isArray(sideLoad)) {  // legacy
      sideLoad = ['sidebar', 'navbar', 'rightSidebar', 'footer'].reduce((acc, key, idx) => {
        if (sideLoad[idx]) {
          acc[key] = sideLoad[idx];
        }
        return acc;
      }, {});
    }

    this.sideLoad = sideLoad;

    this.name = this.name || titleService.getTitle();

    // Get intial meta tags for later
    metaService.getTags('name').forEach(elm => {
      const name = elm.name;
      this.meta[name] = this.meta[name] || elm.content;
    });

    if (typeof this.logLevel !== 'number') {
      this.logLevel = environment.production ?
        NgxLoggerLevel.ERROR :
        NgxLoggerLevel.TRACE;
    }

    logger.updateConfig({ level: this.logLevel });
  }

  private merge(opts: Partial<SettingsService>) {
    Object.assign(this, deepmerge(this, opts));
  }
}
