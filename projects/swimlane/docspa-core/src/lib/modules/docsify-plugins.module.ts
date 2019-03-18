import { NgModule } from '@angular/core';
import { VFile } from '../../vendor';

import { SettingsService } from '../services/settings.service';
import { HooksService } from '../services/hooks.service';

@NgModule({
})
export class UseDocsifyPluginsModule {
  constructor(private settings: SettingsService, private hooksService: HooksService) {
    const docsifyPlugins = this.settings.plugins.filter((p: any) => !p.__annotations__);
    this.settings.plugins = this.settings.plugins.filter((p: any) => p.__annotations__);
    this.addDocsifyPlugins(docsifyPlugins);
  }

  addDocsifyPlugins(plugins: any[]) {
    const vm = {  // Mock docsify vm for docsify plugins
      config: this.settings,
      route: {
        file: ''
      }
    };

    const beforeEach = (fn: Function) => {
      // todo: async
      this.hooksService.hooks.beforeEach.tap('docsify-beforeEach', (vf: VFile) => {
        vm.route.file = vf.data.docspa.url;
        vf.contents = fn(vf.contents);
        return vf;
      });
    };

    const afterEach = (fn: Function) => {
      // todo: async
      this.hooksService.hooks.afterEach.tap('docsify-afterEach', (vf: VFile) => {
        vm.route.file = vf.history[1].replace(/^\//, '');
        vf.contents = fn(vf.contents);
        return vf;
      });
    };

    const doneEach = (fn: Function) => {
      this.hooksService.hooks.doneEach.tap('docsify-doneEach', () => {
        setTimeout(() => {  // get rid of this, could be called after component renders
          return fn();
        }, 30);
      });
    };

    const hooks = {
      init: (fn: Function) => fn(), // Called when the script starts running, only trigger once, no arguments
      beforeEach, // Invoked each time before parsing the Markdown file
      afterEach, // Invoked each time after the Markdown file is parsed
      doneEach, // Invoked each time after the data is fully loaded, no arguments
      // mounted // Called after initial completion. Only trigger once, no arguments.
      // ready // Called after initial completion, no arguments.
    };

    // initialize docsify plugins
    plugins.forEach(p => p(hooks, vm));
  }
}
