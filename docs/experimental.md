# Experimental

## Search

<md-toc-search summary="SUMMARY"></md-toc-search>

## Diff

Diff:

```diff
- import { Hello } from './hello';
+ import { GoodBye } from './hello';

(function(win) {
-  win['hello'] = new Hello();
+  win['goodbye'] = new GoodBye();
})(this);
```

JS:

```js
- import { Hello } from './hello';
+ import { GoodBye } from './hello';

(function(win) {
-  win['hello'] = new Hello();
+  win['goodbye'] = new GoodBye();
})(this);
```

JS + Diff

```js { diff }
- import { Hello } from './hello';
+ import { GoodBye } from './hello';

(function(win) {
-  win['hello'] = new Hello();
+  win['goodbye'] = new GoodBye();
})(this);
```

## Tabs

[[tabs | Tab Set 1]]
| [[tab | a]]
| | *Hello*
|
| [[tab | b]]
| | **Welcome**
|
| [[tab | c]]
| | !> Goodbye

[[tabs]]
| [[tab | a]]
| | Hello A
|
| [[tab | b]]
| | Hello B

[[tabs]]
| [[tab | C]]
| | ```c
| | printf("HELLO WORLD!");
| | ```
|
| [[tab | Java]]
| | ```java
| | System.out.println("HELLO WORLD!");
| | ```
|
| [[tab | Python]]
| | ```python
| | print("HELLO WORLD!")
| | ```
|
| [[tab | JavaScript]]
| | ```js
| | console.log("HELLO WORLD!");
| | ```

## Shortcodes

### TOC

[[example]]
|
| [[toc]]
|
| [[spoiler]]
| | ```markdown
| | [[toc]]
| | ```

## Column/Grid Layout

[[grid]]
| Live Angular examples in markdown | Custom elements and Angular Elements | Remark plugins | Compatible with many docsify plugins and themes |
| -|-|-|-|
| Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis molestie erat. Mauris hendrerit risus vitae est pretium facilisis. Curabitur ac elit congue, pellentesque neque non, tempus mi. In hac habitasse platea dictumst. Duis consectetur elit et turpis fermentum auctor. In nibh magna, bibendum ornare posuere non, vestibulum eu velit. Vivamus tristique id lacus ac egestas. Duis consectetur orci sed dui aliquam, eget porttitor ligula pulvinar. | Suspendisse potenti. Ut dolor est, vehicula in suscipit nec, ornare at libero. Duis eget sollicitudin ex. Etiam vestibulum sagittis quam, quis finibus ligula tincidunt in. Nulla congue non lacus at dictum. Nulla in nulla nulla. Maecenas dignissim vestibulum ornare. Proin vehicula, ex sed faucibus mattis, ex sem sodales leo, eu vehicula erat odio sed metus. | Ut ullamcorper porta ex, ultricies maximus dui placerat vitae. In hac habitasse platea dictumst. Morbi in mi leo. Aliquam erat volutpat. Integer ut leo maximus, ornare arcu in, dignissim urna. Quisque non dapibus mi. Donec semper mauris ipsum, ac sagittis nunc rhoncus sit amet. Morbi nec ipsum vitae velit vulputate posuere quis at mauris. Ut at libero at dui euismod consequat non eget sapien | Curabitur semper tempus orci eget feugiat. Fusce ultrices nulla sed quam pretium vehicula. Curabitur vulputate dolor quis tincidunt faucibus. Quisque sit amet bibendum nulla. Fusce ac sapien fermentum, posuere nulla sed, bibendum leo. Praesent ac elit eu elit vestibulum ultrices non eu leo. Nulla orci nisl, suscipit sed pellentesque vitae, bibendum nec nisl. Aenean vulputate orci nibh, sed lacinia dui iaculis suscipit. Etiam vehicula accumsan finibus. Etiam sit amet dolor orci. In sit amet odio interdum, dignissim arcu eu, congue erat. |

[[grid]]
| ![](./assets/docspa_mark-only.png) | **DocSPA** is the best<br />Really! |
| -|-|

## Pull quote

-> **This is a pull quote**  
-> *Lorem ipsum dolor sit amet*

**Lorem ipsum dolor sit amet**, consectetur adipiscing elit. Sed quis molestie erat. Mauris hendrerit risus vitae est pretium facilisis. Curabitur ac elit congue, pellentesque neque non, tempus mi. In hac habitasse platea dictumst. Duis consectetur elit et turpis fermentum auctor. In nibh magna, bibendum ornare posuere non, vestibulum eu velit. Vivamus tristique id lacus ac egestas. Duis consectetur orci sed dui aliquam, eget porttitor ligula pulvinar.

<> **This is a left pull quote**  
<> *Suspendisse potenti.*

**Suspendisse potenti.** Ut dolor est, vehicula in suscipit nec, ornare at libero. Duis eget sollicitudin ex. Etiam vestibulum sagittis quam, quis finibus ligula tincidunt in. Nulla congue non lacus at dictum. Nulla in nulla nulla. Maecenas dignissim vestibulum ornare. Proin vehicula, ex sed faucibus mattis, ex sem sodales leo, eu vehicula erat odio sed metus.

<style>
blockquote.box {
  float: right;
  width: 30%;
  margin: 0.4em 0 0 20px;
  background: #ddf;
  padding: 13px;
}

blockquote.box-left {
  float: left;
  width: 30%;
  background: #ddf;
  margin: 0.4em 20px 0 0;
  padding: 13px;
  border-left: none;
  border-right: 4px solid var(--theme-color, #0074d9);
}
</style>

## Inline Quote

The paragraph starts here and you can <q>mention the in-line quote here</q> and the paragraph continues

## Cite

<cite>The impression sunrise</cite> by Monet in 1972.

## Ordered List with Images

1. One

    ![](/assets/docspa_mark-only.png)

2. Two

    ![](/assets/docspa_mark-only.png)

3. Three

```javascript { .linenos mark="13-27" }
const config = {
  name: 'DocSPA',
  basePath: 'docs/',
  homepage: 'README.md',
  notFoundPage: '_404.md',
  sideLoad: [
    '_sidebar.md',
    '_navbar.md',
    '_right_sidebar.md',
    '_footer.md'
  ],
  coverpage: '_coverpage.md',
  plugins: [
    mermaidHook,
    tabsHook
  ],
  remarkPlugins: [
    ...defaultRemarkPlugins,
    mermaid,
    prism
  ],
  runtimeModules: [
    CommonModule,
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  environment,
  theme: {
    '--theme-color': '#0089FF',
    '--theme-color-secondary-light': '#0074d92e'
  }
};
```

## Links

[Inline link](content)

[Inline link with title](content "Google")

[Reference link by name][link1]

[Reference link by number][1]

[Reference link by self]

[link1]: content
[1]: content
[Reference link by self]: content

## Lazy loaded images

![image](https://1000ch.github.io/lazyload-image/assets/img/1.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/2.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/3.jpg){ is="lazyload-image" offset="0px" width="25%" }

<p></p>

![image](https://1000ch.github.io/lazyload-image/assets/img/4.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/5.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/6.jpg){ is="lazyload-image" offset="0px" width="25%" }

![image](https://1000ch.github.io/lazyload-image/assets/img/7.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/8.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/9.jpg){ is="lazyload-image" offset="0px" width="25%" }

![image](https://1000ch.github.io/lazyload-image/assets/img/10.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/11.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/12.jpg){ is="lazyload-image" offset="0px" width="25%" }

![image](https://1000ch.github.io/lazyload-image/assets/img/13.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/14.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/15.jpg){ is="lazyload-image" offset="0px" width="25%" }

![image](https://1000ch.github.io/lazyload-image/assets/img/16.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/17.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/18.jpg){ is="lazyload-image" offset="0px" width="25%" }

![image](https://1000ch.github.io/lazyload-image/assets/img/19.jpg){ is="lazyload-image" offset="0px" width="25%" }
![image](https://1000ch.github.io/lazyload-image/assets/img/20.jpg){ is="lazyload-image" offset="0px" width="25%" }
