import { Injectable, Inject, Optional, forwardRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

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
  remarkPlugins = [];
  runtimeModules = [];

  currentTheme: Theme = {};

  get root() {
    return join(this.nameLink, this.basePath);
  }

  constructor(
    metaService: Meta,
    titleService: Title,
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

    this.currentTheme = (config && config.theme) || {};

    if (config && config.themeColor) {
      this.currentTheme['--theme-color'] = config.themeColor;
    }

    // todo: make dynamic
    for (const key in this.currentTheme) {
      if (this.currentTheme.hasOwnProperty(key)) {
        document.body.style.setProperty(key, this.currentTheme[key]);
      }
    }

    this.name = this.name || titleService.getTitle();

    // Get intial meta tags for later
    metaService.getTags('name').forEach(elm => {
      const name = elm.name;
      this.meta[name] = this.meta[name] || elm.content;
    });
  }

  private merge(opts: Partial<SettingsService>) {
    Object.assign(this, deepmerge(this, opts));
  }
}
