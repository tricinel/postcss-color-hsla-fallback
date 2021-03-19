/* eslint-disable import/no-nodejs-modules */
const path = require('path');
const fs = require('fs');
const postcss = require('postcss');
const plugin = require('..');

function getFilePath(filename) {
  return path.join(process.cwd(), '__tests__/__fixtures__', filename);
}

function readFile(name) {
  return fs.readFileSync(name, 'utf8');
}

function processCssFromFile(
  cssFileName,
  opts = {},
  postcssOpts = { from: getFilePath(cssFileName) }
) {
  return postcss()
    .use(plugin(opts))
    .process(readFile(postcssOpts.from), postcssOpts).css;
}

describe('Convert hsl() and hsla() to hex for known properties', () => {
  test('All known properties', () => {
    const css = processCssFromFile('all-properties.css');
    expect(css).toMatchInlineSnapshot(`
          "body {
            background-color: #bb6363;
            background-color: hsla(0, 39%, 56%, 1);
            background: #bb6363;
            background: hsla(0, 39%, 56%, 1);
            border-bottom-color: #a03131;
            border-bottom-color: hsl(0, 53%, 41%);
            border-color: #507c6b;
            border-color: hsl(157, 22%, 40%);
            border-left-color: #543636;
            border-left-color: hsla(0, 22%, 27%, 0.568);
            border-right-color: #6261b8;
            border-right-color: hsla(241, 38%, 55%, 0.39);
            border-top-color: #3c534a;
            border-top-color: hsla(157, 16%, 28%, 0.356);
            border: 1px solid #a33333;
            border: 1px solid hsl(0, 52%, 42%);
            caret-color: #51a031;
            caret-color: hsl(103, 53%, 41%);
            color: #360a48;
            color: hsl(283, 76%, 16%);
            column-rule-color: #3154a0;
            column-rule-color: hsl(221, 53%, 41%);
            column-rule: #a03197;
            column-rule: hsl(305, 53%, 41%);
            filter:  hue-rotate(180deg) drop-shadow(10px 10px 10px #a03131);
            filter:  hue-rotate(180deg) drop-shadow(10px 10px 10px hsl(0, 53%, 41%));
            outline-color: #322a2a;
            outline-color: hsl(0, 9%, 18%);
            outline: #a03131;
            outline: hsl(0, 53%, 41%);
            text-decoration-color: #12026e;
            text-decoration-color: hsl(249, 96%, 22%);
            text-shadow: 1px 1px 2px #490b4b;
            text-shadow: 1px 1px 2px hsla(298, 74%, 17%, 0.5);
          }
          "
      `);
  });

  test('Ignores unknown properties', () => {
    const css = processCssFromFile('unknown-properties.css');
    const originalCss = readFile(getFilePath('unknown-properties.css'));
    expect(css).toEqual(originalCss);
  });

  test('Ignores other color formats', () => {
    const css = processCssFromFile('mixed-color-formats.css');
    expect(css).toMatchInlineSnapshot(`
          "body {
            background-color: #bb6363;
            background-color: hsla(0, 39%, 56%, 1);
            background: #bb6363;
            border-bottom-color: #a03131;
            border-bottom-color: hsl(0, 53%, 41%);
            border-color: rgb(80, 124, 107);
            border-left-color: #543636;
            border-left-color: hsla(0, 22%, 27%, 0.568);
            border-right-color: rgba(98, 97, 184, 0.39);
          }
          "
      `);
  });
});

describe('Plugin options', () => {
  test('Preserve original hsl() and hsla() values in addition to their hex computed properties', () => {
    const css = processCssFromFile('preserve-original.css');
    expect(css).toMatchInlineSnapshot(`
      "body {
        color: #3154a0;
        color: hsl(221, 53%, 41%);
      }
      "
    `);
  });

  test('Replace original hsl() and hsla() values with their hex computed properties', () => {
    const css = processCssFromFile('preserve-original.css', {
      preserve: false
    });
    expect(css).toMatchInlineSnapshot(`
      "body {
        color: #3154a0;
      }
      "
    `);
  });

  test('Skip certain properties when computing the hex values', () => {
    const css = processCssFromFile('skip-properties.css', {
      skipProperties: ['border-color']
    });
    expect(css).toMatchInlineSnapshot(`
      "body {
        border-color: hsl(221, 53%, 41%);
        color: #3154a0;
        color: hsl(221, 53%, 41%);
      }
      "
    `);
  });

  test('Skip certain properties and replace original hsl() and hsla() values with their hex computed properties', () => {
    const css = processCssFromFile('skip-properties.css', {
      preserve: false,
      skipProperties: ['border-color']
    });
    expect(css).toMatchInlineSnapshot(`
      "body {
        border-color: hsl(221, 53%, 41%);
        color: #3154a0;
      }
      "
    `);
  });
});

describe('CSS Extras', () => {
  test('Keep comments and !important', () => {
    const css = processCssFromFile('keep-extras.css');
    expect(css).toMatchInlineSnapshot(`
      "body {
        /* This is comment */
        border-color: #3154a0 !important;
        border-color: hsl(221, 53%, 41%) !important;
        background-color: #7b4242;
        background-color: hsl(0, 30%, 37%); /* This is a comment */
        color: #3154a0 !important;
        color: hsl(221, 53%, 41%) !important; /* This is a comment */
      }
      "
    `);
  });

  test('Keep comments and !important when replacing hsl() and hsla() with hex', () => {
    const css = processCssFromFile('keep-extras.css', { preserve: false });
    expect(css).toMatchInlineSnapshot(`
      "body {
        /* This is comment */
        border-color: #3154a0 !important;
        background-color: #7b4242; /* This is a comment */
        color: #3154a0 !important; /* This is a comment */
      }
      "
    `);
  });
});
