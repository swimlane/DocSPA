# DocspaCoreModule

<small>(required)</small>

This module includes the core services and components required by DocSPA.  This module is required and should be imported using the `forRoot()` static method and providing a `config` object described below.

```js { mark="3,14" }
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DocspaCoreModule } from '@swimlane/docspa-core';

import { AppComponent } from './app.component';
import { config } from '../docspa.config';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DocspaCoreModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

DocSPA settings are derived from the following sources in order of least to highest priority:

- `SetttingService`
- `window.$docsify`
- `DocspaCoreModule.forRoot(config)`

Here is a basic DocSPA config with notes:

```json
{
  "basePath": "docs/",              // Where the markdown files are located
  "homepage": "README.md",          // Default page to load when navigating to a directrory
  "sideLoad": [                     // Additional content load (can be set to false)
    "_sidebar.md",
    "_navbar.md",
    "_right_sidebar.md",
    "_footer.md"
  ],
  "coverpage": "_coverpage.md"     // Coverpage to load (can be set to false)
};
```

i> In the [quick start](../quickstart) setup the config file is located at `src/docspa.config.ts`.  The location and filename is arbitrary but must be imported and used as a parameter for the `DocspaCoreModule.forRoot()` method.
