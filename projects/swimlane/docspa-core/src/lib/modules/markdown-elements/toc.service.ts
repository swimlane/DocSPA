import { Injectable } from '@angular/core';

import * as MDAST from 'mdast';
import toString from 'mdast-util-to-string';
import visit from 'unist-util-visit';
import toc from 'mdast-util-toc';
import { resolve } from 'url';

import { LocationService } from '../../services/location.service';
import { RouterService } from '../../services/router.service';
import { TOCData, VFile } from '../../../vendor';

interface Link extends MDAST.Link {
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class TocService {
  constructor(
    private locationService: LocationService,
    private routerService: RouterService
  ) {
  }
  // TODO: rename below plugins

  tocPlugin = (options: any) => {
    return (tree: MDAST.Root) => {
      const result = toc(tree, options);

      tree.children = [].concat(
        tree.children.slice(0, result.index),
        result.map || []
      );

      return visit(tree, 'listItem', (node: any, index: number, parent: any) => {
        if (node.children.length > 1) {
          node.data = node.data || {};
          node.data.hProperties = node.data.hProperties || {};
          node.data.hProperties.class = node.data.hProperties.class || [];
          node.data.hProperties.class.push('has-children');
        }
        return true;
      });
    };
  };

  linkPlugin = () => {
    return (tree: MDAST.Root, file: VFile) => {
      file.data = file.data || {};
      file.data.tocSearch = [];
      return visit(tree, 'link', (node: Link, index: number, parent: MDAST.Parent) => {
        file.data.tocSearch.push(this.convertToTocData(file, node, parent));
        return true;
      });
    };
  }

  removeNodesPlugin = (minDepth: number) => {
    return (tree: MDAST.Root) => {
      return visit(tree, 'heading', (node: MDAST.Heading, index: number, parent: any) => {
        if (node.depth < minDepth) {
          parent.children.splice(index, 1);
        }
        return true;
      });
    };
  };

  private convertToTocData(file: VFile, node: Link, parent?: MDAST.Parent): TOCData {
    const content = toString(node);
    const name = (file.data.matter ? file.data.matter.title : false) || file.data.title || file.path;

    let url = node.url;
    if (node.data && node.data.hProperties && node.data.hProperties.source) {
      const { source } = node.data.hProperties;

      // resolve path relative to source document
      url = resolve(source, url);
    }

    let [link = '', fragment]: any = url.split('#');
    
    // resolve path relative to componnet
    link = this.locationService.prepareLink(link, this.routerService.root);

    // Hack to preserve trailing slash
    if (link.length > 1 && link.endsWith('/')) {
      link = [link, ''];
    }

    fragment = fragment ? fragment.replace(/^#/, '') : undefined;


    return {
      name,
      url,
      content,
      link,
      fragment,
      depth: node.depth as number
    }
  }
}