import { TestBed, inject } from '@angular/core/testing';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { MarkdownService } from './markdown.service';
import { Page } from './page.model';

describe('MarkdownService', () => {
  let markdownService: MarkdownService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerModule.forRoot({ level: NgxLoggerLevel.TRACE })
      ],
      providers: [
        Location,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        MarkdownService
      ]
    });

    markdownService = TestBed.get(MarkdownService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(markdownService).toBeTruthy();
  });

  it('should load and process a file', () => {
    const text = '## Hello';
    markdownService.getMd('docs/README.md').subscribe((res: Page) => {
      expect(res).toBeTruthy();
      expect(res.resolvedPath).toEqual('docs/README.md');
      expect(res.contents).toEqual('<h2>Hello</h2>\n');

      expect(res.path).toEqual('README.html');
      expect(res.base).toEqual('README');
      expect(res.fullpath).toEqual('docs/README.html');
      expect(res.text).toEqual(text);
    });

    const countryRequest = httpMock.expectOne('docs/README.md');
    countryRequest.flush(text);

    httpMock.verify();
  });
});
