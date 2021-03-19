const valueParser = require('postcss-value-parser');

// Copy pasted and adapted from https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
// Transform an HSL value into its HEX counterpart
function hslToHex({ hue, saturation, lightness }) {
  const a = (saturation * Math.min(lightness, 1 - lightness)) / 100;
  function f(n) {
    const k = (n + hue / 30) % 12;
    const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // Convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Figure out if a value contains hsl or hsla
function isHslDeclaration(value) {
  return value.indexOf('hsl') !== -1;
}

// Create a Declaration parser
// According to the PostCSS API docs, this is the fastest
// https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md#23-use-fast-nodes-scanning
// For each property in the list, it returns an object of the shape:
// ```
// color: (decl) => {
//  ...
// },
// background: (decl) => {
//  ...
// }
function declarationReplacers(properties, preserve) {
  function replacer(decl) {
    if (!decl.value || !isHslDeclaration(decl.value)) {
      return;
    }

    // We don't need a fallback if the previous prop equals the current
    if (decl.prev() && decl.prev().prop === decl.prop) {
      return;
    }

    const parsedValue = valueParser(decl.value)
      .walk((node) => {
        const { nodes, value, type } = node;
        if (type === 'function' && isHslDeclaration(value)) {
          const hue = parseInt(nodes[0].value, 10);
          const saturation = parseInt(nodes[2].value, 10);
          const lightness = parseInt(nodes[4].value, 10);

          if (
            typeof hue === 'number' &&
            typeof saturation === 'number' &&
            typeof lightness === 'number'
          ) {
            /* eslint-disable no-param-reassign */
            node.type = 'word';
            node.value = hslToHex({
              hue,
              saturation,
              lightness: lightness / 100
            });
            /* eslint-enable no-param-reassign */
          }
        }
      })
      .toString();

    if (parsedValue !== decl.value) {
      decl.cloneBefore({ value: parsedValue });
      if (!preserve) {
        decl.remove();
      }
    }
  }

  return properties.reduce(
    (replacers, property) => ({
      ...replacers,
      [property]: replacer
    }),
    {}
  );
}

const defaultProperties = [
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
];

const defaults = {
  skipProperties: [],
  preserve: true
};

/**
 * PostCSS plugin to transform hsl() and hsla() to hexadecimal
 */
module.exports = (options = {}) => {
  const {
    preserve = defaults.preserve,
    skipProperties = defaults.skipProperties
  } = options;

  const finalProperties = defaultProperties.filter(
    (property) => !skipProperties.includes(property)
  );

  return {
    postcssPlugin: 'postcss-color-hsla-fallback',
    Declaration: declarationReplacers(finalProperties, preserve)
  };
};

module.exports.postcss = true;
