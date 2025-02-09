# babel-plugin-px-to-rem

A Babel plugin that converts pixel values to rem units in your JavaScript/JSX files.

> **Note**: This plugin is designed to work with JSX/React syntax, making it perfect for React applications.

A Babel plugin that automatically converts pixel values to rem units in your JavaScript and React code. This plugin handles both static values and dynamic values (variables, props, etc.).

## Features

- Converts pixel values to rem in JavaScript and React inline styles
- Handles both static and dynamic values
- Supports string values with 'px' suffix (e.g., "200px")
- Supports numeric values (e.g., 200)
- Preserves values already in rem or em
- Handles null, undefined, and other non-convertible values
- Works with variables, props, and state values
- Optional SVG support for proportional scaling of SVG elements

## Installation

```bash
npm install --save-dev babel-plugin-px-to-rem
# or
yarn add -D babel-plugin-px-to-rem
```

## Usage

### With .babelrc

```json
{
  "plugins": [
    ["babel-plugin-px-to-rem", {
      "baseFontSize": 16,
      "properties": ["width", "height", "padding", "margin"],
      "includeNodeModules": false,
      "isConvertSvgs": false
    }]
  ]
}
```

### With babel.config.js

```javascript
module.exports = {
  plugins: [
    ['babel-plugin-px-to-rem', {
      baseFontSize: 16,
      properties: ['width', 'height', 'padding', 'margin'],
      includeNodeModules: false,
      isConvertSvgs: false
    }]
  ]
};
```

### With Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              ['babel-plugin-px-to-rem', {
                baseFontSize: 16,
                properties: ['width', 'height', 'padding', 'margin'],
                includeNodeModules: false,
                isConvertSvgs: false
              }]
            ]
          }
        }
      }
    ]
  }
};
```

### With Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  esbuild: {
    jsxInject: `import React from 'react'`
  },
  build: {
    rollupOptions: {}
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: []
    }
  },
  babel: {
    plugins: [
      ['babel-plugin-px-to-rem', {
        baseFontSize: 16,
        properties: ['width', 'height', 'padding', 'margin'],
        includeNodeModules: false,
        isConvertSvgs: false
      }]
    ]
  }
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseFontSize` | number | 16 | The base font size in pixels to calculate rem values |
| `properties` | string[] | [see default list] | Array of CSS properties to convert |
| `includeNodeModules` | boolean | false | Whether to process files in node_modules |
| `isConvertSvgs` | boolean | false | When true, converts SVG-specific properties to rem units for proportional scaling |

### SVG Support

When `isConvertSvgs` is set to `true`, the plugin will convert the following SVG-specific properties to rem units:

- Basic dimensions: `width`, `height`
- Position attributes: `x`, `y`, `cx`, `cy`
- Shape attributes: `r`, `rx`, `ry`, `x1`, `x2`, `y1`, `y2`
- Stroke properties: `strokeWidth`, `strokeDasharray`, `strokeDashoffset`
- Text properties: `fontSize`, `letterSpacing`, `baselineShift`, `kerning`, `wordSpacing`
- Marker properties: `markerHeight`, `markerWidth`, `refX`, `refY`
- Path-specific: `pathLength`, `points` (for polygon/polyline), `d` (for path)

This is particularly useful when you want SVG elements to scale proportionally with the root font size, enabling responsive scaling across different screen sizes.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseFontSize` | number | 16 | The base font size to use for rem calculations |
| `properties` | string[] | [see below] | Array of CSS properties to convert |
| `includeNodeModules` | boolean | false | Whether to process files in node_modules |

### Default Properties

By default, the plugin converts the following CSS properties:
```javascript
[
  "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "top", "right", "bottom", "left",
  "border", "borderWidth", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
  "borderRadius", "outlineWidth",
  "lineHeight", "letterSpacing",
  "fontSize",
  "columnGap", "rowGap", "gap",
  "inset", "insetBlock", "insetInline",
  "objectPosition", "backgroundPosition", "backgroundSize",
  "boxShadow", "textShadow",
  "transform"
]
```

## Examples

```javascript
// Input
const styles = {
  width: "200px",
  height: 400,
  padding: "16px",
  margin: "32px",
  fontSize: "14px"
};

// Output
const styles = {
  width: "12.5rem",
  height: "25rem",
  padding: "1rem",
  margin: "2rem",
  fontSize: "0.875rem"
};

// Dynamic values
const height = "400px";
const width = 200;

// In React component
<div style={{ width: width, height: height }}>
  // Will be converted to:
  // <div style={{ width: "12.5rem", height: "25rem" }}>
</div>
```

## Notes

- Values that are already in rem or em units will be preserved
- null and undefined values will be preserved
- The plugin works with both static values and dynamic values (variables, props, state)
- For dynamic values, the conversion happens at runtime
- The plugin is safe to use with any CSS-in-JS solution

## License

MIT
