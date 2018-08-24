import { Injectable, Inject, Optional } from '@angular/core';

import deepmerge from 'deepmerge'; // use xtend?

export interface Theme {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  name = '';
  homepage = 'README.md';
  sideLoad = [];

  coverpage = '';
  basePath = 'docs/';
  nameLink = '';
  ext = '.md';
  notFoundPage = '_404.md';

  plugins = [];
  remarkPlugins = [];
  runtimeModules = [];

  currentTheme: Theme = {};

  constructor(@Optional() @Inject('config') config: any) {
    if (window['$docsify']) {
      this.merge(window['$docsify']);
    }

    if (config) {
      this.merge(config);
    }

    if (!Array.isArray(this.sideLoad)) {
      this.sideLoad = [this.sideLoad];
    }

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
  }

  private merge(opts: Partial<SettingsService>) {
    Object.assign(this, deepmerge(this, opts));
  }
}
