import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, share, catchError } from 'rxjs/operators';
import { normalize } from 'path';
import { resolve } from 'url';

import { join } from '../utils';
import { SettingsService } from './settings.service';

export interface CachePage {
  resolvedPath: string;
  notFound: boolean;
  contents: string;
}

@Injectable({
  providedIn: 'root'
})
export class FetchService {
  private inFlight = new Map<string, Observable<CachePage>>();

  get root() {
    return this.settings.root;
  }

  get path404() {
    return join(this.settings.root, this.settings.notFoundPage);
  }

  constructor(
    private http: HttpClient,
    private settings: SettingsService
  ) {
  }

  /**
   * Finds a file returning a prmomise of the url
   * Returns null in the file is not found
   *
   * @param dir
   * @param filename
   */
  async find(dir: string, filename: string): Promise<string> {
    const url = filename ? resolve(dir, filename) : null;
    const item = await this.get(url).toPromise();
    if (!item) {
      throw new Error('Possible chache error');
    }
    return item.notFound || !url ? null : item.resolvedPath;
  }

  /**
   * Finds a file returning a prmomise of the url
   * If the file is not found in the given dir, will look up a directory
   * Returns null in the file is not found up to the root
   *
   * @param root {string} root directory to search up to
   * @param from {string} Base URL (excluding root) being resolved against.
   * @param to {string} the filename to resolve.
   */
  async findup(root: string, from: string, to: string): Promise<string> {
    const url = to ? join(root, resolve(from, to)) : null;
    const item = await this.get(url).toPromise();
    if (!item) {
      throw new Error('Possible chache error');
    }
    if (item.notFound) {
      if (from === '/') {
        return null;
      }
      from = normalize(join(from, '..'));
      return from === '/'
        ? await this.find(join(root, from), to)
        : await this.findup(root, from, to);
    }
    return item.resolvedPath;
  }

  /**
   *
   * @param url {string} Full path relative to root
   */
  get(url: string): Observable<CachePage> {
    if (!url) {
      return of({
        resolvedPath: url,
        contents: '',
        notFound: false
      });
    }

    if (this.inFlight.has(url)) {
      return this.inFlight.get(url);
    }

    let notFound = url === this.path404;
    const obs: Observable<CachePage> = this.http
      .get(url, { responseType: 'text' })
      .pipe(
        catchError(() => {
          notFound = true;
          return this.http.get(this.path404, { responseType: 'text' });
        }),
        map((contents: string) => {
          this.inFlight.delete(url);
          return {
            contents,
            notFound,
            resolvedPath: url
          };
        }),
        share()
      );

    this.inFlight.set(url, obs);
    return obs;
  }
}
