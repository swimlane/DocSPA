import { TestBed } from '@angular/core/testing';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { FetchService, CachePage } from './fetch.service';
import { DOCSPA_ENVIRONMENT } from '../docspa-core.tokens';

describe('FetchService', () => {
  let fetchService: FetchService;
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
        { provide: DOCSPA_ENVIRONMENT, useValue: { } },
        FetchService
      ]
    });

    fetchService = TestBed.inject(FetchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(fetchService).toBeTruthy();
  });

  it('should load a file', () => {
    const text = '## Hello';

    fetchService.get('docs/README.md').subscribe((res: CachePage) => {
      expect(res).toBeTruthy();
      expect(res.resolvedPath).toEqual('docs/README.md');
      expect(res.contents).toEqual(text);
    });

    httpMock
      .expectOne('docs/README.md')
      .flush(text);

    httpMock.verify();
  });

  it('should load and cache a file', () => {
    const text = '## Hello';

    fetchService.get('docs/README.md').subscribe((res: CachePage) => {
      expect(res).toBeTruthy();
      expect(res.resolvedPath).toEqual('docs/README.md');
      expect(res.contents).toEqual(text);
    });

    fetchService.get('docs/README.md').subscribe((res: CachePage) => {
      expect(res).toBeTruthy();
      expect(res.resolvedPath).toEqual('docs/README.md');
      expect(res.contents).toEqual(text);
    });

    httpMock
      .expectOne('docs/README.md')
      .flush(text);

    httpMock.verify();
  });

  xit('should disable cache', () => {
    const text = '## Hello';

    fetchService.get('docs/README.md' /*, { cache: false } */).subscribe((res: CachePage) => {
      expect(res).toBeTruthy();
      expect(res.resolvedPath).toEqual('docs/README.md');
      expect(res.contents).toEqual(text);
    });

    fetchService.get('docs/README.md' /*, { cache: false } */).subscribe((res: CachePage) => {
      expect(res).toBeTruthy();
      expect(res.resolvedPath).toEqual('docs/README.md');
      expect(res.contents).toEqual(text);
    });

    const x = httpMock
      .match('docs/README.md');

    x.forEach(_ => _.flush(text));

    expect(x.length).toEqual(2);

    httpMock.verify();
  });
});
