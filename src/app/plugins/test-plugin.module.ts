import { NgModule } from '@angular/core';
import { HooksService } from '@swimlane/docspa-core';
import VFILE from 'vfile';

/* An example plugin module */

@NgModule({
})
export class TestPluginModule {
  constructor(hooksService: HooksService) {
    hooksService.hooks.afterEach.tap('docsify-beforeEach', (vf: VFILE.vfile) => {
      vf.contents += ` HTML generated ${new Date()} `;
      return vf;
    });
  }
}
