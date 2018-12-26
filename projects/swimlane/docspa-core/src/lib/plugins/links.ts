import visit from 'unist-util-visit';
import { LocationService } from '../services/location.service';
import VFILE, { default as VFile } from 'vfile';
import MDAST from 'mdast';
import UNIST from 'unist';

interface Link extends MDAST.Link {
  data: any;
}

export const links = (locationService: LocationService) => {
  return (tree: UNIST.Node, vfile: VFile.VFile) => {
    visit(tree, ['link', 'definition'] as any, (node: Link, index, parent) => {
      if (node && parent && index !== undefined && !LocationService.isAbsolutePath(node.url)) {

        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};

        if ('ignore' in node.data.hProperties || node.data.originalUrl || node.data.hProperties.target) {
          return;
        }

        node.data.originalUrl = node.url;

        node.url = ('download' in node.data.hProperties) ?
          locationService.prepareSrc(node.url, vfile.path) :
          locationService.prepareLink(node.url, vfile.history[0]);
      }
      return true;
    });
  };
};

export const images = (locationService: LocationService) => {
  return (tree: UNIST.Node, vfile: VFILE.VFile) => {
    visit(tree, 'image', (node: MDAST.Image) => {
      // src urls are relative to fullpath
      node.url = locationService.prepareSrc(node.url, vfile.path);
      return true;
    });
  };
};
