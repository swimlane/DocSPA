import { Injectable } from '@angular/core';
import { AsyncSeriesWaterfallHook, SyncHook } from 'tapable';

@Injectable({
  providedIn: 'root'
})
export class HooksService {
  init = new SyncHook(); // Called when the script starts running, only trigger once, no arguments
  beforeEach = new AsyncSeriesWaterfallHook(['vfile']);  // Invoked each time before parsing the Markdown file.
  afterEach = new AsyncSeriesWaterfallHook(['vfile']); // Invoked each time after the Markdown file is parsed.
  doneEach = new SyncHook(['vfile']); // Invoked each time after the data is fully loaded
  mounted = new SyncHook(); // Called after initial completion.  (ngOnInit)
  ready = new SyncHook(); // Called after initial completion.  (ngAfterViewInit)
  destroy = new SyncHook(); // Called after initial completion.  (ngOnDestroy)
}
