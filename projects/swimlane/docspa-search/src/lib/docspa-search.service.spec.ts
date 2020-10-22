import { TestBed } from '@angular/core/testing';

import { DocspaSearchService } from './docspa-search.service';

describe('DocspaSearchService', () => {
  let service: DocspaSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocspaSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
