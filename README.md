# postcss-scopes

[PostCSS](https://github.com/postcss/postcss) plugin that automagic adds scopes to CSS

## Features

- Nested scopes
- Support for pseudo-elements on scoped elements
- Global classes inside the scopes, using `global` attribute, or automatically by matching pattern in `globalPatterns` option
- Automatic html recomposition, which doesn't break initial code
- Easy integration into an existing project

## What is it ?

Imagine that you have HTML like this:

```html
<div class="title">Main title</div>
<div class="block">
  <div class="title">Block Title</div>
</div>
```

and CSS:

```css
.title {
  background: #da9a9a;
}
.block .title {
  color: #da9a9a;
}
```

If we try to display this markup, we get a problem:

![Without scopes](https://raw.githubusercontent.com/sms-system/postcss-scopes/master/img/without_scopes.png)

`.block .title` inherited styles from root .title, but we don't want this.

**And what to do ?**
  
Just add attribute `scoped` to element with class `.block`,

```html
<div class="title">Main title</div>
<div class="block" scoped>
  <div class="title">Block Title</div>
</div>
```

and all classes inside it automagically become isolated.

![Without scopes](https://raw.githubusercontent.com/sms-system/postcss-scopes/master/img/with_scopes.png)

After the transformation HTML and CSS become like this:

```html
<div class="title">Main title</div>
<div class="block">
  <div class="title_scope1">Block Title</div>
</div>
```

```css
.title {
  background: #da9a9a;
}
.block .title, .block .title_scope1 {
  color: #da9a9a;
}
```

## Options

#### globalPatterns
Type: `Array` Array of RegExp patterns matching global classes

#### html
Type: `String` Initial html

#### getHTML
Type: `Function`, arguments `html` The function takes an argument compiled html for further processing

## Example

```js
postcss([
  scopes({
    globalPatterns: ['^js-'],
    html: `
      <div class="title">Main title</div>
      <div class="block" scoped>
        <div class="title js-title-class">Block Title</div>
      </div>`,
    getHTML: function (html) {
      console.log(html)
    }
  })
]).process(`
  .title {
    background: #da9a9a;
  }
  .js-title-class {
    text-decoration: underline;
  }
  .block .title {
    color: #da9a9a;
  }`
)
```

## Support

Please [open an issue](https://github.com/sms-system/postcss-scopes/issues/new) for support.
