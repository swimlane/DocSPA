
# DocspaSearchComponent

<small>(optional, external)</small>

This module full text search to DocSPA.

```js { mark="4,16" }
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DocspaCoreModule } from '@swimlane/docspa-core';
import { DocspaSearchComponent } from '@swimlane/docspa-search';

import { AppComponent } from './app.component';
import { config } from '../docspa.config';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DocspaCoreModule.forRoot(config),
    DocspaSearchComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Usage

Custom element: `<md-search>`  

Used to include full-text search.

```markdown { playground }
<md-search summary="SUMMARY"></md-search>
```
