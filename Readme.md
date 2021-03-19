# postcss-color-hsla-fallback

[PostCSS](https://github.com/postcss/postcss) plugin to transform `hsl()` and `hsla()` to hexadecimal.

> Inspiration for this plugin comes from [postcss-color-rgba-fallback](https://github.com/postcss/postcss-color-rgba-fallback)

## Installation

With npm:

```bash
npm install postcss-color-hsla-fallback --save-dev
```

or with yarn:

```bash
yarn add postcss-color-hsla-fallback --dev
```

Also make sure you have `postcss` installed:

```bash
npm install postcss --save-dev
```

```bash
yarn add postcss --dev
```

## Usage

```js
const fs = require('fs');
const postcss = require('postcss');
const colorHslaFallback = require('postcss-color-hsla-fallback');

const css = fs.readFileSync('input.css', 'utf8');

const output = postcss()
  .use(colorHslaFallback())
  .process(css)
  .css;
```

Using this `input.css`:

```css
body {
  color: hsl(0, 53%, 41%);
}

```

you will get:

```css
body {
  color: #a03131;
  color: hsl(0, 53%, 41%);
}
```

## Options

### `preserve` (default: `true`)

Allows you to preserve the original `hsl()` or `hsla()` colors in the output.

Possible values:

- `true`: Keeps `hsl()` and `hsla()` values in the output.
- `false`: Removes `hsl()` and `hsla()` values from the output and replaces them with their hex computed values.

With `preserve: false` you will get:

```css
body {
  color: #a03131;
}
```

### `skipProperties` (default: '[]`)

Allows you to skip specific properties from the list so that they are not replaced with their hex computed values.

Possible values includes one or more from this list:

```
[
  'background-color',
  'background',
  'border-bottom-color',
  'border-color',
  'border-left-color',
  'border-right-color',
  'border-top-color',
  'border',
  'caret-color',
  'color',
  'column-rule-color',
  'column-rule',
  'filter',
  'outline-color',
  'outline',
  'text-decoration-color',
  'text-shadow'
]
```

### Requirements

This plugin requires `postcss` v8+.

#### Contributing

- Run tests with `npm run test` or `yarn test`.
- Run the lint with `npm run lint` or `yarn lint`.

For details, check out the [Contributing][contributing] guide.

##### LICENSE

MIT

[contributing]: ./Contributing.md
