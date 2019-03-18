import { Injectable } from '@angular/core';
import { AsyncSeriesWaterfallHook, SyncHook } from 'tapable';

@Injectable({
  providedIn: 'root'
})
export class HooksService {
  hooks = {
    beforeEach: new AsyncSeriesWaterfallHook(['vfile']),
    afterEach: new AsyncSeriesWaterfallHook(['vfile']),
    doneEach: new SyncHook(['vfile'])
  };
}
