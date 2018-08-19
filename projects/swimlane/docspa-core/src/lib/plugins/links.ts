import visit from 'unist-util-visit';
import { LocationService } from '../services/location.service';
import { Page } from '../services/page.model';

export const links = (locationService: LocationService) => {
  return (tree, vfile: Page) => {
    visit(tree, 'link', node => {
      // links are not relative to base path
      node.url = locationService.prepareLink(node.url, vfile.base);
    });
  };
};

export const images = (locationService: LocationService) => {
  return (tree, vfile: Page) => {
    visit(tree, 'image', node => {
      // src urls are relative to fullpath
      node.url = locationService.prepareSrc(node.url, vfile.fullpath);
    });
  };
};
