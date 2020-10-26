import { Injectable, EventEmitter, SimpleChange, SimpleChanges, NgZone } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { NGXLogger } from 'ngx-logger';

import { goExternal, isAbsolutePath } from '../shared/utils';
import { getFullPath } from '../shared/vfile';

import { SettingsService } from './settings.service';
import { FetchService } from './fetch.service';
import { LocationService } from './location.service';

import { VFile } from '../shared/vfile';

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
  root: string;

  contentPage: string;

  /**
   * Emitted whenever page content changes, include side loaded content
   */
  changed = new EventEmitter<SimpleChanges>();

  constructor(
    private settings: SettingsService,
    private fetchService: FetchService,
    private locationService: LocationService,
    private logger: NGXLogger,
    private router: Router,
    private ngZone: NgZone
  ) {
    if (window['Cypress']) {
      window['cypressNavigateByUrl'] = (url: string) => this.navigateByUrl(url);
    }
  }

  activateRoute(snapshot: ActivatedRouteSnapshot) {
    const url = snapshot.url.map(s => s.path).join('/');
    let root = this.router.url;
    if (snapshot.fragment) {
      root = root.replace(new RegExp('#' + snapshot.fragment + '$'), '');
    }
    root = root.replace(new RegExp(url + '$'), '');
    if (!root.endsWith('/')) {
      root += '/';
    }
    const path = url + (snapshot.fragment ? `#${snapshot.fragment}` : '');
    this.go(path, root);
  }

  go(url: string, root = this.root) {
    url = url || '/';
    if (isAbsolutePath(url)) {
      goExternal(url);
      return Promise.resolve({});
    }
    url = this.canonicalize(url);
    return this.urlChange(url || '/', root);
  }

  navigateByUrl(url: string) {
    this.ngZone.run(() => {
      this.router.navigateByUrl(url);
    });
  }

  private async urlChange(url: string = '/', root = this.root) {
    const changes: SimpleChanges = {};

    this.logger.debug(`location changed: ${url}`);

    if (this.root !== root) {
      changes.root = new SimpleChange(this.root, this.root = root, false);
    }

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

    return changes;
  }

  private canonicalize(url: string) {
    const hp = this.settings.homepage.replace(/\.md$/, '');
    url = url.replace(/\.md$/, '');
    url = url.replace(new RegExp(`${hp}\$`), '/');
    return url;
  }

  private async resolveCoverPath(vfile: VFile) {
    const path = vfile.basename === this.settings.homepage ?
      await this.fetchService.find(getFullPath(vfile), this.settings.coverpage) :
      null;
    return this.locationService.stripBasePath(path);
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
      acc[key] = this.locationService.stripBasePath(path);
      return acc;
    }, {} as {[key: string]: string});
  }
}
