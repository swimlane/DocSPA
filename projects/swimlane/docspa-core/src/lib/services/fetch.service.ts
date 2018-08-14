import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, share, catchError } from 'rxjs/operators';
import * as path from 'path';
import * as QuickLRU from 'quick-lru';

import { SettingsService } from './settings.service';
import { Page } from './page.model';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
  private cache = new QuickLRU<string, Page>({maxSize: 100});
  private inFlight = new Map<string, Observable<Page>>();

  get root() {
    return path.join(this.settings.nameLink, this.settings.basePath);
  }

  get path404() {
    return path.join(this.settings.nameLink, this.settings.basePath, this.settings.notFoundPage);
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
    const url = filename ? path.join(dir, filename) : null;
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
    const url = filename ? path.join(dir, filename) : null;
    return this.get(url).toPromise().then(item => {
      if (item.notFound) {
        if (dir === path.basename(this.settings.basePath)) {
          return null;
        } else {
          dir = path.join(dir, '..');
          return (dir === '.') ? this.find(dir, filename) : this.findup(dir, filename);
        }
      }
      return url;
    });
  }

  /**
   *
   * @param url {string} Full path relitive to root
   */
  get(url: string): Observable<Page>  {
    // todo: consume a vfile/page
    if (!url) {
      return of(new Page({
        // url,
        timestampCached: Date.now(),
        text: '',
        notFound: false,
        data: {
          docspa: {
            url
          }
        }
      }));
    }

    if (this.cache.has(url)) {
      return of(this.cache.get(url));
    }

    if (this.inFlight.has(url)) {
      return this.inFlight.get(url);
    }

    let notFound = url === this.path404;
    const obs = this.http.get(url, {responseType: 'text'})
      .pipe(
        catchError(() => {
          notFound = true;
          if (this.cache.has(this.path404)) {
            return of(this.cache.get(this.path404).text);
          }
          return this.http.get(this.path404, {responseType: 'text'});
        }),
        map((text: string) => {
          return new Page({
            // url,
            timestampCached: Date.now(),
            text,
            notFound,
            data: {
              docspa: {
                url
              }
            }
          });
        }),
        map((item: Page) => {
          this.cache.set(url, item);
          if (notFound) {
            this.cache.set(this.path404, item);
          }
          this.inFlight.delete(url);
          return item;
        }),
        share()
      );
    this.inFlight.set(url, obs);
    return obs;
  }
}
