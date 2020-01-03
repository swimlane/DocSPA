
# DocspaStackblitzModule

<small>(optional, external)</small>

This module allows embedding StackBlitz projects within markdown using a `embed-stackblitz` custom element and the [[stackblitz]] shortcode.

```js { mark="3,15" }
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DocspaCoreModule } from '@swimlane/docspa-core';
import { DocspaStackblitzModule } from '@swimlane/docspa-stackblitz';

import { AppComponent } from './app.component';
import { config } from '../docspa.config';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DocspaCoreModule.forRoot(config),
    DocspaStackblitzModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

The `embed-stackblitz` custom element accepts a [StackBlitz project payload](https://stackblitz.com/docs#project-payload) as the `project` input.

```markdown { playground }
<embed-stackblitz
  title='Embeded StackBlitz Project<br />DocSPA'
  project='{"template": "javascript", "files": {"index.js": "console.log(123)", "index.html": "Hello World"} }'>
</embed-stackblitz>
```

or a path to a project payload (`JSON` file) in the documentation local files (relative to the document root folder):

```markdown { playground }
[[stackblitz title="Local StackBlitz Project<br />DocSPA" project-path="examples/folder/stackblitz" ]]
```

i> When providing a payload path, if the `files` property of the payload contains an array, this is treated as an array of relative paths from which the file content will be loaded.

You may also supply a `project-id` to to load an existing StackBlitz project:

```markdown { playground }
<embed-stackblitz
  title='Existing StackBlitz Project<br />DocSPA'
  project-id="sdk-create-project">
</embed-stackblitz>
```

If a both `project-id` and either a `project-path` or `project` input are provided, the files listed in the local project's files are treated as a a patch to the existing StackBlitz project.

```markdown { playground }
<embed-stackblitz
  title='Existing StackBlitz Project with local changes<br />DocSPA'
  project-id="sdk-create-project"
  project-path="/examples/folder/stackblitz">
</embed-stackblitz>
```