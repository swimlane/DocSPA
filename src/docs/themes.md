# Themes

DocSPA supports [docsify themes](https://docsify.js.org/#/themes?id=themes). To include a theme add the desired style sheet in your `index.html` file.

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

## Customization

Add CSS variables to root in `styles.css` to customize internal styles.

```css
:root {
  --theme-color: #0074d9;
  --sidebar-width: 16rem;
  --right-sidebar-width: 16rem;
  --right-sidebar-border-color: none;
  --base-background-color: #F5F7F9;
  --sidebar-background: #F5F7F9;
  --right-sidebar-background: #FFF;
  --cover-background-color: linear-gradient(to left bottom, hsl(211, 100%, 85%) 0%,hsl(169, 100%, 85%) 100%);
  --sidebar-border-color: rgba(0,0,0,0.07);
  --sidebar-border-width: 1px;
  --cover-border-inset: 50px;
  --cover-background-color: linear-gradient(to left bottom, hsl(211, 100%, 85%) 0%,hsl(169, 100%, 85%) 100%);
}
```
