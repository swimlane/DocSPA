import visit from 'unist-util-visit';
import { LocationService } from '../services/location.service';
import VFile from 'vfile';
import { MDAST } from 'mdast';

/* export const links = (locationService: LocationService) => {
  return (tree, vfile: VFile) => {
    visit(tree, ['link', 'definition'] as any, (node: MDAST.Link) => {



      // links are not relative to base path
      node.url = locationService.prepareLink(node.url, vfile.history[0]);
      return true;
    });
  };
}; */

export const links = (locationService: LocationService) => {
  return (tree, vfile: VFile) => {
    visit(tree, ['link', 'definition'] as any, (node: MDAST.Link, index, parent) => {
      if (node && parent && index !== undefined && !LocationService.isAbsolutePath(node.url)) {
        node.data = node.data || {};
        if (node.data.originalUrl) {
          return;
        }

        node.data.originalUrl = node.url;
        node.url = locationService.prepareLink(node.url, vfile.history[0]);

        const nodes = [
          {
            type: 'html',
            value: `<md-link href="${node.url}">`
          },
          node,
          {
            type: 'html',
            value: `</md-link>`
          }
        ];

        parent.children.splice(index, 1, ...nodes);
      }
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
