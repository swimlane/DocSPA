import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, share, catchError } from 'rxjs/operators';
import { join } from '../utils';
import { basename } from 'path';
import QuickLRU from 'quick-lru';

import { SettingsService } from './settings.service';

export interface CachePage {
  resolvedPath: string;
  timestampCached: Date;
  notFound: boolean;
  contents: string;
}

@Injectable({
  providedIn: 'root'
})
export class FetchService {
  private cache = new QuickLRU<string, CachePage>({maxSize: 100});
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
  find(dir: string, filename: string): Promise<string> {
    const url = filename ? join(dir, filename) : null;
    return this.get(url).toPromise().then(item => {
      if (item.notFound) {
        return null;
      }
      return url;
    });
  }

  /**
   * Finds a file returning a prmomise of the url
   * If the file is not found in the given dir, will look up a directory
   * Returns null in the file is not found up to the root
   *
   * @param dir
   * @param filename
   */
  findup(dir: string, filename: string) {
    const url = filename ? join(dir, filename) : null;
    return this.get(url).toPromise().then(item => {
      if (item.notFound) {
        if (dir === basename(this.settings.basePath)) {
          return null;
        } else {
          dir = join(dir, '..');
          return (dir === '.') ? this.find(dir, filename) : this.findup(dir, filename);
        }
      }
      return url;
    });
  }

  /**
   *
   * @param url {string} Full path relative to root
   */
  get(url: string, options = { cache: true }): Observable<CachePage>  {
    if (!url) {
      return of({
        resolvedPath: url,
        timestampCached: new Date(),
        contents: '',
        notFound: false
      });
    }

    if (options.cache && this.cache.has(url)) {
      return of(this.cache.get(url));
    }

    if (options.cache && this.inFlight.has(url)) {
      return this.inFlight.get(url);
    }

    let notFound = url === this.path404;
    const obs: Observable<CachePage> = this.http.get(url, { responseType: 'text' })
      .pipe(
        catchError(() => {
          notFound = true;
          if (this.cache.has(this.path404)) {
            return of(this.cache.get(this.path404).contents);
          }
          return this.http.get(this.path404, { responseType: 'text' });
        }),
        map((contents: string) => {
          return {
            timestampCached: Date.now(),
            contents,
            notFound,
            resolvedPath: url
          };
        }),
        map((item: CachePage) => {
          if (options.cache) {
            this.cache.set(url, item);
            if (notFound) {
              this.cache.set(this.path404, item);
            }
            this.inFlight.delete(url);
          }
          return item;
        }),
        share()
      );
    this.inFlight.set(url, obs);
    return obs;
  }
}
