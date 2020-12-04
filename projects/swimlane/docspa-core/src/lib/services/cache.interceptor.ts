import { Injectable } from '@angular/core';
import { HttpEvent, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import QuickLRU from 'quick-lru';

import { SettingsService } from './settings.service';

import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor
} from '@angular/common/http';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache: QuickLRU<string, HttpEvent<any>>;

  constructor(settings: SettingsService) {
    const maxSize = settings.maxPageCacheSize || 20;
    this.cache = new QuickLRU({ maxSize });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isCachable(req)) {
      return next.handle(req);
    }

    if (this.cache.has(req.url)) {
      const cachedResponse = this.cache.get(req.url);
      return cachedResponse instanceof HttpErrorResponse ?
        throwError(cachedResponse) :
        of(cachedResponse);
    }
    return this.sendRequest(req, next);
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {

    const set = (event: HttpEvent<any>) => {
      if (event instanceof HttpResponse || event instanceof HttpErrorResponse) {
        this.cache.set(req.url, event as HttpEvent<any>);
      }
    };

    return next.handle(req).pipe(
      tap(set, set)
    );
  }

  isCachable(req: HttpRequest<any>) {
    return req.method === 'GET';
  }
}
