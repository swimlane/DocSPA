import { Location } from '@angular/common';
import { Injectable } from '@angular/core';

import { stripBaseHref, stripIndexHtml } from '../shared/utils';

@Injectable()
export class LocationWithSlashes extends Location {
  private _baseHref: string;

  normalize(url: string) {
    return stripBaseHref(this._baseHref, stripIndexHtml(url));
  }
}