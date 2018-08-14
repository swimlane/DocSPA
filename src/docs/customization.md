# Customization

## Config File

The DocSPA configuration should be modified by editing the `docspa.config.ts` file in the in the `src` folder. To support docsify plugins include a `window.$docsify = { plugins: [] };` in `index.html`. DocSPA settings are derived from the following sources in order of least to highest priority:

- `SetttingService`
- `window.$docsify`
- `docspa.config.ts`

See the [Config Reference](config) for a full list of configuration options.

## Themes

DocSPA supports [docsify themes](https://docsify.js.org/#/themes?id=themes). To include a theme include the desired style sheet in your `index.html` file.

```html
<link rel="stylesheet" href="//unpkg.com/docsify/themes/vue.css">
<link rel="stylesheet" href="//unpkg.com/docsify/themes/buble.css">
<link rel="stylesheet" href="//unpkg.com/docsify/themes/dark.css">

<!-- compressed -->
<link rel="stylesheet" href="//unpkg.com/docsify/lib/themes/vue.css">
<link rel="stylesheet" href="//unpkg.com/docsify/lib/themes/buble.css">
<link rel="stylesheet" href="//unpkg.com/docsify/lib/themes/dark.css">
<link rel="stylesheet" href="//unpkg.com/docsify/lib/themes/pure.css">
```

## *remark* Plugins

DocSPA utilizes remark for markdown parsing and thereby supports [remark plugins](https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins). To include a remark plugin import it and included it in the `remarkPlugins` array in `docspa.config.ts`.

## *docsify* Plugins

DocSPA supports many (but not all) [docsify plugins](https://docsify.js.org/#/plugins?id=list-of-plugins). To include a docsify plugin be sure to have a global `$docsify` object defined in `index.html` then import the desired plugin. Unlike remark plugins, docsify plugins only run on the page content.

The following docsify plugins are known to work at this time:

- [zoom-image](https://docsify.js.org/#/plugins?id=zoom-image)
- [emoji](https://docsify.js.org/#/plugins?id=emoji)
- [docsify-copy-code](https://docsify.js.org/#/plugins?id=copy-to-clipboard)
- [Edit on github](https://docsify.js.org/#/plugins?id=edit-on-github)

## Custom Elements

Custom Elements defined within or imported to the application are available to use within the markdown. This includes Angular components that are converted to Custom Elements using [Angular Elements](https://angular.io/guide/elements).

## Runtime code

DocSPA includes a custom element for embedded Angular templates. To make angular modules available to the runtime component include the module in `runtimeModules` array in `docspa.config.ts`.
