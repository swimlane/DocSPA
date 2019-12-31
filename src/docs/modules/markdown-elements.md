# MarkdownElementsModule

<small>(recommended)</small>

DocSPA was designed to work with custom elements (part of the [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) suite of technologies).  Once a custom component is loaded they may be embedded directly into the markdown.

i> Custom elements can be defined using `window.customElements.define` or using [angular elements](https://angular.io/guide/elements).

This module provides several core angular componets for DocSPA and is already imported by the `DocspaCoreModule` module.  Including this module in your root application module (using `forRoot`) will also make these angular componets available in markdown as custom elements.  Without this module these custom elements are not available for use within markdown.  Many custom elements are also defined and aliased to short codes as noted below.

```js { mark="3,15" }
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DocspaCoreModule, MarkdownElementsModule } from '@swimlane/docspa-core';
import { preset } from '@swimlane/docspa-remark-preset';

import { AppComponent } from './app.component';
import { config } from '../docspa.config';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DocspaCoreModule.forRoot(config),
    MarkdownElementsModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Table of Contents

Custom element: `<md-toc>`  
Shortcode: `[[toc]]`

Used to include the table of contents for a give path.

```markdown { playground }
[[toc path="features" max-depth="2"]]
```

i> The path is always relative to the root docs folder.  Including `md-toc` without a path will load the TOC for the current page (main content).  Using the shortcode `[[toc]]` without a path will insert TOC for the page the shortcodes is found in.

## Include

Custom element: `<md-include>`  
Shortcode: `[[include]]`

This shortcode allows including other files within markdown.

```markdown { playground }
[[include path="/examples/embed.md"]]
```

including code blocks:

```markdown { playground }
[[include path="/examples/embed.js" codeblock="js" safe="true"]]
```

## Environment Variables

Custom element: `<md-env>`  
Shortcode: `[[env]]`

This shortcode allows displaying variables defined in the "environment" property.

```markdown { playground }
[[env var="version"]]
Production? <md-env var="production" />
```

!> It is usally expected that `environment` property will contain the contents of your project's `environment.ts`.  `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.  The list of file replacements can be found in `angular.json`.
