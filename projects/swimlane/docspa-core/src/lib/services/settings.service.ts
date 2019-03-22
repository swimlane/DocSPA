import { Injectable, Inject, Optional, forwardRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import deepmerge from 'deepmerge'; // use xtend?
import { join } from '../utils';

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

  get root() {
    return join(this.nameLink, this.basePath);
  }

  constructor(
    metaService: Meta,
    titleService: Title,
    @Optional() @Inject('environment') environment: any,
    @Optional() @Inject('config') config: any
  ) {
    if (window['$docsify']) {
      this.merge(window['$docsify']);
    }

    if (config) {
      this.merge(config);
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
