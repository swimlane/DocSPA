import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import sdk from '@stackblitz/sdk';
import { Project, EmbedOptions } from '@stackblitz/sdk/typings/interfaces';

import { SettingsService } from '@swimlane/docspa-core';

const join = Location.joinWithSlash;

// from https://github.com/browserify/path-browserify/blob/master/index.js
function dirname(path: string) {
  if (path.length === 0) { return '.'; }
  let code = path.charCodeAt(0);
  const hasRoot = code === 47 /*/*/;
  let end = -1;
  let matchedSlash = true;
  for (let i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) { return hasRoot ? '/' : '.'; }
  if (hasRoot && end === 1) { return '//'; }
  return path.slice(0, end);
}

@Component({
  selector: 'embed-stackblitz', // tslint:disable-line
  template: `
    <div *ngIf="!opened" class="placeholder" (click)="load()">
      <div *ngIf="title" class="title" [innerHTML]="title"></div>
      <div class="open-button">Run Project <i class="material-icons">play_arrow</i></div>
    </div>
    <div [attr.id]="id"></div>
  `,
  styles: [`
    .placeholder {
      width: 100%;
      height: 350px;
      background: #353535;
      position: relative;
    }

    .placeholder .open-button {
      display: inline-block;
      padding: 1em;
      border: 2px solid white;
      color: white;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
    }

    .placeholder .title {
      display: inline-block;
      padding: 1em;
      color: white;
      position: absolute;
      top: 0;
      left: 0;
      cursor: pointer;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class EmbedStackblitzComponent {
  static readonly is = 'embed-stackblitz';

  static count = 0;

  @Input()
  projectPath: string;

  @Input()
  set project(val: Project) {
    this._project = typeof val === 'string' ? JSON.parse(val as string) : val;
  }
  get project(): Project {
    return this._project;
  }

  @Input()
  projectId: string;

  @Input()
  set embedOpts(val: EmbedOptions) {
    this._embedOpts = typeof val === 'string' ? JSON.parse(val as string) : val;
  }
  get embedOpts(): EmbedOptions {
    return this._embedOpts;
  }

  @Input()
  title = '';

  opened = false;

  private _project: Project;
  private _embedOpts: EmbedOptions = {
    height: '350px',
    clickToLoad: false
  };

  id = `embed-stackblitz-${EmbedStackblitzComponent.count++}+${Math.random()}`;

  private get root() {
    return this.settings.basePath;
  }

  constructor(private http: HttpClient, private settings: SettingsService) {
  }

  load() {
    this.opened = true;
    if (typeof this.project === 'string') {
      this.project = JSON.parse(this.project as string);
    }

    // if path is defined, load path and start again
    if (this.projectPath && !this.project) {
      return this.loadProjectFile(this.projectPath).then(project => {
        this.project = project;
        this.load();
      });
    }

    if (this.projectId) {
      this.embedProjectId(this.projectId, this.project);
    } else if (this.project) {
      this.embedProject(this.project);
    }
  }

  private embedProjectId(id: string, project?: Project): Promise<any> {
    return sdk.embedProjectId(this.id, id, this.embedOpts).then(vm => {
      if (project) {
        const diff = { create: project.files, destroy: [] };
        return vm.applyFsDiff(diff);
      }
    });
  }

  private embedProject(project: any): Promise<any> {
    return sdk.embedProject(this.id, project, this.embedOpts);
  }

  private loadProjectFile(file: string): Promise<Project> {
    const url = join(this.root, `${this.projectPath}.json`);
    return this.http.get(url, {responseType: 'json'}).toPromise().then((project: any) => {
      if (Array.isArray(project.files)) {
        return Promise.all(project.files.map(f => {
          const u = join(join(this.root, dirname(this.projectPath)), f);
          return this.http.get(u, {responseType: 'text'}).toPromise().then(text => [f, text]);
        })).then(f => {
          const files = f.reduce((acc, val: [string, string]) => {
            acc[val[0]] = val[1];
            return acc;
          }, {});
          return {...project, files};
        });
      } else {
        return project;
      }
    });
  }
}
