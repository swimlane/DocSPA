import { Component, OnInit, Renderer, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';

import { of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import unified from 'unified';
import markdown from 'remark-parse';
import visit from 'unist-util-visit';
import stringify from 'remark-stringify';
import toString from 'mdast-util-to-string';
import slug from 'remark-slug';
import frontmatter from 'remark-frontmatter';
import { MDAST } from 'mdast';

import GithubSlugger from 'github-slugger';

import { FetchService, LocationService, SettingsService } from '@swimlane/docspa-core';

export const join = Location.joinWithSlash;

@Component({
  selector: 'app-print-preview',
  templateUrl: './print-preview.component.html',
  styleUrls: ['./print-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrintPreviewComponent implements OnInit {

  summary = 'SUMMARY';
  processLinks: any;
  pages: any[];
  paths: string[];
  private slugger: GithubSlugger;

  constructor(
    private fetchService: FetchService,
    private locationService: LocationService,
    private renderer: Renderer,
    private settings: SettingsService) {
    const getLinks = () => {
      return (tree, file) => {
        file.data = file.data || {};
        file.data.tocSearch = [];
        visit(tree, 'link', (node: MDAST.Link) => {
          const url = node.url;
          const content = toString(node);
          const name = (file.data.matter ? file.data.matter.title : false) || file.data.title || file.path;
          file.data.tocSearch.push({
            name,
            url,
            content,
            depth: (node as any).depth
          });
          return true;
        });
      };
    };

    this.processLinks = unified() // md -> md + links
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(getLinks)
      .use(stringify);
  }

  ngOnInit() {
    this.loadSummary(this.summary).then(paths => {
      this.slugger = new GithubSlugger();

      paths.unshift(this.summary);

      if (this.settings.coverpage) {
        paths.unshift(this.settings.coverpage);
      }

      this.paths = paths;

      this.pages = paths.map(path => {
        return {
          path,
          slug: this.slugger.slug(path)
        };
      });
      this.renderer.setElementClass(document.body, 'ready', true);
    });
  }

  private loadSummary(summary: string) {
    const vfile = this.locationService.pageToFile(summary);
    const fullPath = join(vfile.cwd, vfile.path);
    return this.fetchService.get(fullPath).pipe(
      flatMap((resource: any) => {
        vfile.contents = resource.contents;
        vfile.data = vfile.data || {};
        return resource.notFound ? of(null) : this.processLinks.process(vfile);
      }),
      map((_: any) => {
        return _.data.tocSearch.map(__ => __.url);
      })
    ).toPromise();
  }
}
