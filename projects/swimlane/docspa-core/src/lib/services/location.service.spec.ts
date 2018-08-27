import { TestBed, inject } from '@angular/core/testing';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';

import { LocationService } from './location.service';
import { SettingsService } from './settings.service';

describe('LocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Location,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        SettingsService,
        LocationService
      ]
    });
  });

  it('isAbsolutePath', () => {
    expect(LocationService.isAbsolutePath('./')).toBeFalsy();
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
    expect(service.prepareLink('thepage', '/')).toBe('#/thepage');
    expect(service.prepareLink('thepage', '/features/')).toBe('#/features/thepage');
    expect(service.prepareLink('../thepage', '/features/sub/')).toBe('#/features/thepage');

    expect(service.prepareLink('thepage#anchor', '/')).toBe('#/thepage#anchor');
    expect(service.prepareLink('thepage#anchor', '/features/')).toBe('#/features/thepage#anchor');
    expect(service.prepareLink('../thepage#anchor', '/features/sub/')).toBe('#/features/thepage#anchor');

    expect(service.prepareLink('#anchor', '/')).toBe('#/#anchor');
    expect(service.prepareLink('http://www.swimlane.com', '/')).toBe('http://www.swimlane.com');
  }));

  it('#prepareLink', inject([LocationService], (service: LocationService) => {
    expect(service.prepareSrc('image.png', '/')).toBe('/image.png');
    expect(service.prepareSrc('image.png', '/features/')).toBe('/features/image.png');
    expect(service.prepareSrc('../image.png', '/features/sub/')).toBe('/features/image.png');
  }));

  it('#stripBaseHref', inject([LocationService], (service: LocationService) => {
    expect(service.stripBaseHref('docs/thepage')).toBe('thepage');
    expect(service.stripBaseHref('docs/features/thepage')).toBe('features/thepage');
    expect(service.stripBaseHref('docs/features/thepage#anchor')).toBe('features/thepage#anchor');
  }));
});
