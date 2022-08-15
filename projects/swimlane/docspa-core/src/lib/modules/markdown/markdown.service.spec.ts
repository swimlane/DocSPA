import { TestBed } from '@angular/core/testing';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import VFILE from 'vfile';
import unindent from 'strip-indent';

import { MarkdownService } from './markdown.service';
import { DOCSPA_ENVIRONMENT } from '../../docspa-core.tokens';

import type { VFile } from '../../shared/vfile';
import { RouterService } from '../../services/router.service';
import { Router } from '@angular/router';

describe('MarkdownService', () => {
  let markdownService: MarkdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [
        HttpClientTestingModule,
        LoggerModule.forRoot({ level: NgxLoggerLevel.WARN })
    ],
    providers: [
        { provide: Router, useValue: {} },
        Location,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: DOCSPA_ENVIRONMENT, useValue: {} },
        MarkdownService,
        RouterService
    ],
    teardown: { destroyAfterEach: false }
});

    markdownService = TestBed.inject(MarkdownService);
    TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(markdownService).toBeTruthy();
  });

  it('processes a vfile', async () => {
    const vfile = VFILE('## Hello') as VFile;
    await markdownService.process(vfile);
    expect(vfile.contents).toEqual('<h2>Hello</h2>');
  });

  it('process a vfile to get the TOC', async () => {
    const vfile = VFILE(`# Hello\n## World`);
    vfile.history[0] = '/README.md';
    await markdownService.processTOC(vfile);
    expect(String(vfile)).toEqual(unindent(`
      <ul>
      <li class="has-children">
      <p><md-link href="/README.md#hello" link="/README.md" fragment="hello" source="/README.md">Hello</md-link></p>
      <ul>
      <li><md-link href="/README.md#world" link="/README.md" fragment="world" source="/README.md">World</md-link></li>
      </ul>
      </li>
      </ul>`).trim());
  });

  it('process a vfile to get the TOC', async () => {
    const vfile = VFILE(unindent(`
    # Hello

    World

    ## Goodbye

    Earth`));

    vfile.history[0] = '/README.md';
    const sections = await markdownService.getSections(vfile);
    expect(sections).toEqual([
       {
         heading: 'Hello',
         id: 'hello',
         source: '/README.md',
         text: 'World',
         name: 'Hello',
         depth: 1
       },
       {
         heading: 'Goodbye',
         id: 'goodbye',
         source: '/README.md',
         text: 'Earth',
         name: 'Hello',
         depth: 2
       },
    ]);
  });
});
