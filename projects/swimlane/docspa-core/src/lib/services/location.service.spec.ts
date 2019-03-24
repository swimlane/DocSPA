import { TestBed, inject } from '@angular/core/testing';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { LocationService } from './location.service';
import { SettingsService } from './settings.service';

import { DOCSPA_ENVIRONMENT } from '../docspa-core.tokens';

describe('LocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot({ level: NgxLoggerLevel.WARN })
      ],
      providers: [
        Location,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: DOCSPA_ENVIRONMENT, useValue: { } },
        SettingsService,
        LocationService
      ]
    });
  });

  it('isAbsolutePath', () => {
    expect(LocationService.isAbsolutePath('./')).toBeFalsy();
    expect(LocationService.isAbsolutePath('./test/')).toBeFalsy();
    expect(LocationService.isAbsolutePath('test/')).toBeFalsy();
    expect(LocationService.isAbsolutePath('/')).toBeFalsy();
    expect(LocationService.isAbsolutePath('/test/')).toBeFalsy();
    expect(LocationService.isAbsolutePath('http://www.swimlane.com')).toBeTruthy();
  });

  it('should be created', inject([LocationService], (service: LocationService) => {
    expect(service).toBeTruthy();
    expect(service.root).toBe('docs/');
    expect(service.basePath).toBe('docs/');
  }));

  it('#pageToFile', inject([LocationService], (service: LocationService) => {
    let vfile = service.pageToFile('');
    expect(vfile.path).toBe('/README.md');

    vfile = service.pageToFile('/');
    expect(vfile.path).toBe('/README.md');

    vfile = service.pageToFile('/README');
    expect(vfile.path).toBe('/README.md');

    vfile = service.pageToFile('/README.md');
    expect(vfile.path).toBe('/README.md');

    vfile = service.pageToFile('/features');
    expect(vfile.path).toBe('/features.md');

    vfile = service.pageToFile('/features/');
    expect(vfile.path).toBe('/features/README.md');
  }));

  it('#prepareLink', inject([LocationService], (service: LocationService) => {
    expect(service.prepareLink('thepage', '/')).toBe('/thepage');
    expect(service.prepareLink('thepage', '/features/')).toBe('/features/thepage');
    expect(service.prepareLink('../thepage', '/features/sub/')).toBe('/features/thepage');
    expect(service.prepareLink('/thepage', '/features/sub/')).toBe('/thepage');

    expect(service.prepareLink('http://www.swimlane.com', '/')).toBe('http://www.swimlane.com');
  }));

  it('#prepareLink with anchors', inject([LocationService], (service: LocationService) => {
    expect(service.prepareLink('thepage#anchor', '/')).toBe('/thepage#anchor');
    expect(service.prepareLink('thepage#anchor', '/features/')).toBe('/features/thepage#anchor');
    expect(service.prepareLink('../thepage#anchor', '/features/sub/')).toBe('/features/thepage#anchor');

    expect(service.prepareLink('#anchor', '/')).toBe('/#anchor');
  }));

  it('#prepareSrc', inject([LocationService], (service: LocationService) => {
    expect(service.prepareSrc('image.png', '/')).toBe('docs/image.png');
    expect(service.prepareSrc('image.png', '/features/')).toBe('docs/features/image.png');
    expect(service.prepareSrc('../image.png', '/features/sub/')).toBe('docs/features/image.png');
    expect(service.prepareSrc('/image.png', '/features/sub/')).toBe('docs/image.png');
  }));

  it('#stripBaseHref', inject([LocationService], (service: LocationService) => {
    expect(service.stripBaseHref('docs/thepage')).toBe('thepage');
    expect(service.stripBaseHref('docs/features/thepage')).toBe('features/thepage');
    expect(service.stripBaseHref('docs/features/thepage#anchor')).toBe('features/thepage#anchor');
  }));
});
