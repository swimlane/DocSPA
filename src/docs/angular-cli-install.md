# Adding DocSPA to a angular cli app

!!> Information in the guid may be out of date.  If you are starting a new projetc we recommend looking at the [quick start](quickstart).

0. Generate new Angular app

```sh
ng new my-docspa-project
cd my-docspa-project
ng serve
```

i> You should now have a fresh angular app visible at http://localhost:4200/.

1. Install DocSPA and peerDependecies

First install DocSPA core:

```sh
npm install --save @swimlane/docspa-core @swimlane/docspa-remark-preset
```

Then peer dependencies:

```sh
npm install --save @ngx-loading-bar/core @ngx-loading-bar/http-client @angular/elements quick-lru ngx-logger quick-lru vfile-reporter url-resolve deepmerge path process smoothscroll-polyfill @stackblitz/sdk @webcomponents/custom-elements
```

2) Add a `docspa.config.ts` to the `src` folder

See [DocspaCoreModule](modules#docspacoremodule)

2) Edit `pollyfill.ts`

Add the following to `pollyfill.ts`:

```typescript
// Used for browsers with partially native support of Custom Elements
import '@webcomponents/custom-elements/src/native-shim';

// Used for browsers without a native support of Custom Elements
import '@webcomponents/custom-elements/custom-elements.min';

import smoothscroll from 'smoothscroll-polyfill';
import * as process from 'process';

smoothscroll.polyfill();
window['process'] = process;
```

3) Edit `index.html` (optional)

Add docsify themes and plugins to `index.html`:

```html { mark="10-15,21,23-31" }
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My DocSPA Project</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="//unpkg.com/docsify/themes/buble.css" />
  <link rel="stylesheet" href="//unpkg.com/prismjs/themes/prism.css" />
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.css">
  <script src="//unpkg.com/docsify-edit-on-github@1.0.1/index.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.min.css" integrity="sha384-9tPv11A+glH/on/wEu99NVwDPwkMQESOocs/ZGXPoIiLE8MU/qkqUcZ3zzL+6DuH" crossorigin="anonymous">
</head>
<body>
  <app-root></app-root>
  <script>
    // support $docsify plugins
    window.$docsify = { plugins: [] };
  </script>
  <script src="//unpkg.com/docsify/lib/plugins/zoom-image.min.js"></script>
  <script src="//unpkg.com/prismjs" data-manual></script>
  <script src="//unpkg.com/prismjs/components/prism-javascript.min.js"></script>
  <script src="//unpkg.com/prismjs/components/prism-json.min.js"></script>
  <script src="//unpkg.com/prismjs/components/prism-markdown.min.js"></script>
  <script src="//unpkg.com/prismjs/components/prism-bash.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script src="//unpkg.com/docsify-copy-code"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.min.js" integrity="sha384-U8Vrjwb8fuHMt6ewaCy8uqeUXv4oitYACKdB0VziCerzt011iQ/0TqlSlv8MReCm" crossorigin="anonymous"></script>
</body>
</html>
```

2) Add `DocspaCoreModule` to `AppModule`

```js { mark="3,13" }
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

2) Modify `app.component.html`

```html
<docspa-page></docspa-page>
```

i> You may alternativly set the `DocSPACoreComponent` component as the `bootstrap` comp.

2) Add `src/docs` with `README.md`

See [content](content).

i> You can use `docsify init ./src/docs` if you like.

3) Edit `angular.json`

Add the `src/docs` folder `angular.json` as an asset

```json { mark="8" }
{
  "projects": {
    "my-docspa-project": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/docs",
              ...
            ],
```


