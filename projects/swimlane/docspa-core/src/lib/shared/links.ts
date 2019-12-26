import visit from 'unist-util-visit';
import { LocationService } from '../services/location.service';
import * as VFILE from 'vfile';
import * as MDAST from 'mdast';

import { Link } from '../../vendor';
import { isAbsolutePath } from '../utils';

/**
 * Convert markdown links to router links
 * 
 * @param locationService 
 */
export const links = (locationService: LocationService) => {
  return (tree: MDAST.Root, vfile: VFILE.VFile) => {
    return visit(tree, ['link', 'definition'], (node: Link, index, parent) => {
      if (node && parent && index !== undefined && !isAbsolutePath(node.url)) {

        node.data = { ...node.data };
        node.data.hProperties = { ...node.data.hProperties };

        if (!node.url || 'ignore' in node.data.hProperties || node.data.originalUrl || node.data.hProperties.target) {
          return;
        }

        node.data.originalUrl = node.url;

        // TODO: move this to md-link comp?
        if ('download' in node.data.hProperties) {
          node.url = locationService.prepareSrc(node.url, vfile.path);
          node.data.hProperties.source = vfile.path;
          return true;
        }

        node.data.hProperties.source = vfile.history[0];
        node.data.hProperties.klass = node.data.hProperties.class;
        delete node.data.hProperties.class;

        node.data.hName = 'md-link';
      }
      return true;
    });
  };
};

export const images = (locationService: LocationService) => {
  return (tree: MDAST.Root, vfile: VFILE.VFile) => {
    return visit(tree, 'image', (node: MDAST.Image) => {
      // src urls are relative to fullpath
      node.url = locationService.prepareSrc(node.url, vfile.path);
      return true;
    });
  };
};
