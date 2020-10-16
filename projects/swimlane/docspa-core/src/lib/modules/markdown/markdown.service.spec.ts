import { TestBed } from '@angular/core/testing';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import VFILE from 'vfile';

import { VFile } from '../../../vendor';
import { MarkdownService } from './markdown.service';
import { DOCSPA_ENVIRONMENT } from '../../docspa-core.tokens';

describe('MarkdownService', () => {
  let markdownService: MarkdownService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerModule.forRoot({ level: NgxLoggerLevel.WARN })
      ],
      providers: [
        Location,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: DOCSPA_ENVIRONMENT, useValue: { } },
        MarkdownService
      ]
    });

    markdownService = TestBed.inject(MarkdownService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(markdownService).toBeTruthy();
  });

  it('process a vfile', async () => {
    const vfile = VFILE('## Hello') as VFile;
    await markdownService.process(vfile);
    expect(vfile.contents).toEqual('<h2>Hello</h2>');
  });
});
