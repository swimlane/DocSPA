# DocsifyPluginsModule

<small>(optional)</small>

DocSPA supports many (but not all) [docsify plugins](https://docsify.js.org/#/plugins?id=list-of-plugins).  To include docsify plugins add the `DocsifyPluginsModule` and a global `$docsify` and include plugin `<script>` tags in your `index.html` just like you would when running docsify.  This module will load docsify plugins and attach them to internal DocSPA hooks.

!> Not all docsify plugins are supported and in general it is preferred to use remark plugins or custom elements.

```html
<script>
  // support $docsify plugins
  window.$docsify = { plugins: [] };
</script>
<script src="//unpkg.com/docsify@4/lib/plugins/zoom-image.min.js"></script>
<script src="//unpkg.com/docsify-copy-code@2"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.min.js"></script>
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
```

```js { mark="3,15" }
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DocspaCoreModule, DocsifyPluginsModule } from '@swimlane/docspa-core';

import { AppComponent } from './app.component';
import { config } from '../docspa.config';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DocspaCoreModule.forRoot(config),
    DocsifyPluginsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Some supported docsify plugins include:

## Zoom Image

```html
<script src="//unpkg.com/docsify@4/lib/plugins/zoom-image.min.js"></script>
```

```markdown { playground }
![](../assets/docspa_mark-only.png)
```

i> Add the `data-no-zoom` attribute to exclude an image `![](../assets/docspa_mark-only.png){ data-no-zoom="true" }`

## Copy Code

```html
<script src="//unpkg.com/docsify-copy-code@2"></script>
```

## Edit on Github

```html
<script src="//unpkg.com/docsify-edit-on-github@1.0.1/index.js"></script>
<script>
  window.$docsify = { 
    plugins: [
      EditOnGithubPlugin.create('https://github.com/swimlane/docspa/blob/master/src/docs/', null, '✎ Edit this page')
    ]
  };
</script>
```
