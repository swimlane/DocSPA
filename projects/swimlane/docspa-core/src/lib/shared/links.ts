import visit from 'unist-util-visit';
import { resolve } from 'url';

import type { Transformer, Attacher } from 'unified';
import type { Node } from 'unist';
import type { Image } from 'mdast';

import { isAbsolutePath } from './utils';
import { LocationService } from '../services/location.service';

import type { VFile } from './vfile';
import type { Link } from './ast';

/**
 * Convert markdown links to router links
 *
 * @param locationService
 */
export const links = (settings: { locationService: LocationService }): Transformer => {
  return (tree: Node, vfile: VFile) => {
    return visit(tree, ['link', 'definition'], (node: Link, index: number, parent: unknown) => {
      if (node && parent && index !== undefined && !isAbsolutePath(node.url)) {

        node.data = { ...node.data };
        node.data.hProperties = { ...node.data.hProperties };

        if (!node.url || 'ignore' in node.data.hProperties || node.data.originalUrl || node.data.hProperties.target) {
          return;
        }

        node.data.originalUrl = node.url;

        // TODO: move this to md-link comp?
        if ('download' in node.data.hProperties) {
          node.url = settings.locationService.prepareSrc(node.url, vfile.path);
          node.data.hProperties.source = vfile.path;
          return true;
        }

        node.url = resolve(vfile.history[0], node.url);

        // eslint-disable-next-line prefer-const
        let [routerLink = '', fragment] = node.url.split('#');
        fragment = fragment ? fragment.replace(/^#/, '') : undefined;

        node.data.hProperties.link = routerLink;
        node.data.hProperties.fragment = fragment;
        node.data.hProperties.source = vfile.history[0];
        node.data.hProperties.klass = node.data.hProperties.class;
        delete node.data.hProperties.class;

        node.data.hName = 'md-link';
      }
      return true;
    });
  };
};

export const images: Attacher = ({locationService}: {locationService: LocationService}): Transformer => {
  return (tree: Node, vfile: VFile) => {
    return visit(tree, 'image', (node: Image) => {
      // src urls are relative to fullpath
      node.url = locationService.prepareSrc(node.url, vfile.path);
      return true;
    });
  };
};
