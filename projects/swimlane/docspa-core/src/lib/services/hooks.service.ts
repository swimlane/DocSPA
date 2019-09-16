import { Injectable } from '@angular/core';
import { AsyncSeriesWaterfallHook, SyncHook } from 'tapable';

@Injectable({
  providedIn: 'root'
})
export class HooksService {
  init = new SyncHook(); // Called when the script starts running, only trigger once, no arguments

  // Invoked while processing markdown
  beforeEach = new AsyncSeriesWaterfallHook(['vfile']);  // MD transform invoked each time before parsing the Markdown file.
  afterEach = new AsyncSeriesWaterfallHook(['vfile']); // HTML transform invoked each time after the Markdown file is parsed.

  // Invoked when dom is updated
  doneEach = new SyncHook(['vfile']); // Invoked each time new main content is loaded (DOM changes)

  // Life cycle
  mounted = new SyncHook(); // Called after initial completion.  (ngOnInit)
  ready = new SyncHook(); // Called after initial completion.  (ngAfterViewInit)
  destroy = new SyncHook(); // Called after when page is destroyed.  (ngOnDestroy)
}
