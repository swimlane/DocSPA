import visit from 'unist-util-visit';
import { LocationService } from '../services/location.service';
import VFile from 'vfile';
import path from 'path';

export const links = (locationService: LocationService) => {
  return (tree, vfile: VFile) => {
    visit(tree, 'link', node => {
      // links are not relative to base path
      node.url = locationService.prepareLink(node.url, vfile.history[0]);
    });
  };
};

export const images = (locationService: LocationService) => {
  return (tree, vfile: VFile) => {
    visit(tree, 'image', node => {
      // src urls are relative to fullpath
      node.url = locationService.prepareSrc(node.url, path.join(vfile.cwd, vfile.path));
    });
  };
};
