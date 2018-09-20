import visit from 'unist-util-visit';
import { LocationService } from '../services/location.service';
import VFile from 'vfile';
import { join } from '../utils';
import { MDAST } from 'mdast';

export const links = (locationService: LocationService) => {
  return (tree, vfile: VFile) => {
    visit(tree, ['link', 'definition'] as any, (node: MDAST.Link) => {
      // links are not relative to base path
      node.url = locationService.prepareLink(node.url, vfile.history[0]);
      return true;
    });
  };
};

export const images = (locationService: LocationService) => {
  return (tree, vfile: VFile) => {
    visit(tree, 'image', (node: MDAST.Image) => {
      // src urls are relative to fullpath
      node.url = locationService.prepareSrc(node.url, vfile.path);
      return true;
    });
  };
};
