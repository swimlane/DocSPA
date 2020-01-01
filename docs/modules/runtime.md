# RuntimeContentModule

<small>(optional)</small>

This module enables embedding runtime Angular templates in markdown content.  As config it requires a list of Angular modules available to the runtime component.

!> This module is not compatible with AOT.

```js { mark="3,15-21" }
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DocspaCoreModule, RuntimeContentModule } from '@swimlane/docspa-core';

import { AppComponent } from './app.component';
import { config } from '../docspa.config';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DocspaCoreModule.forRoot(config),
    RuntimeContentModule.forRoot({
      imports: [
        CommonModule,
        NgxChartsModule,
        BrowserAnimationsModule
      ]
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

The `RuntimeContentModule` provides a `md-runtime` custom element that allows embedding Angular template content into markdown.  The `md-runtime` custom element can be added as HTML into the markdown file:

```markdown { playground }
<md-runtime context='{ "name": "World", "count": 0 }'>
Hello {{name}}.
<br /><button (click)="count = count + 1">Click me: {{count}}</button>
</md-runtime>
```

Or by adding `{ run }` to `HTML` fenced code:

~~~markdown { playground }
```html { run context='{ "name": "World", "count": 0 }' }
Hello {{name}}.
<br /><button (click)="count = count + 1">Click me: {{count}}</button>
```
~~~

Use `{ playground }` to create a section containing both the code and the runtime result:

```html { playground context='{"data": [{"name":"Germany","value": 8940000},{"name":"USA","value":5000000},{"name":"France","value":7200000}]}' }
<div style="width: 100%; height: 200px">
  <ngx-charts-bar-vertical
    [legend]="true"
    [xAxis]="true"
    [yAxis]="true"
    [results]="data">
  </ngx-charts-bar-vertical>
</div>
<pre>
{{data | json}}
</pre>
```

i> The angular components available within a runtime custom element are controlled by the `RuntimeContentModule.forRoot({ import: [...]})` `import` array.  These modules must also be added to your root app module.
