import { Injectable, Inject, Optional } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import deepmerge from 'deepmerge'; // use xtend?

import { DOCSPA_CONFIG_TOKEN } from '../docspa-core.tokens';

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
  // nameLink = '';
  ext = '.md';
  notFoundPage = '_404.md';
  maxPageCacheSize = 100;

  constructor(
    metaService: Meta,
    titleService: Title,
    @Optional() @Inject(DOCSPA_CONFIG_TOKEN) config: any
  ) {
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
