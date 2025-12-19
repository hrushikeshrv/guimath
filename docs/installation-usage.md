---
layout: default
title: Installation & Usage 
nav_order: 2
---

# Installation & Usage
{: .no_toc }

1. TOC
{:toc}

## Installation
GUIMath uses MathJax as a core dependency, so you need to include both MathJax as well as GUIMath into your webpage. GUIMath does not have a built-in renderer, and uses MathJax to render the equations as they are being built.

### CDN

Make sure you include MathJax before including GUIMath.

Then include the GUIMath javascript file and stylesheet. You can include GUIMath's stylesheet before your site's stylesheet, to allow your CSS to override GUIMath's CSS.

The latest version of GUIMath can be found on [jsDelivr](https://www.jsdelivr.com/package/npm/guimath) or [unpkg](https://unpkg.com/browse/guimath/).

```html
<link rel="stylesheet" href="https://unpkg.com/guimath/dist/guimath.css">
<script src="https://unpkg.com/guimath/dist/guimath.min.js"></script>
```

OR

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/guimath/dist/guimath.min.css">
<script src="https://cdn.jsdelivr.net/npm/guimath/dist/guimath.umd.min.js"></script>
```

An example config is shown below using unpkg -

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<link rel="stylesheet" href="https://unpkg.com/guimath/dist/guimath.css">
<script src="https://unpkg.com/guimath/dist/guimath.min.js"></script>
```

### npm
You can also install GUIMath via npm.

```bash
npm install guimath
```
Then import GUIMath and the stylesheet into your JavaScript code.

```javascript
import GUIMath from "guimath";
import "guimath/dist/guimath.css";
```

## Usage

### Using The Form Input
You can use GUIMath to convert an `<input type="text">` element into an equation input using the editor widget.

The behaviour is straightforward. GUIMath will hide the actual `<input>` element and show users a button asking them to enter an equation. Once they are done entering the equation, it will generate the LaTeX for the created equation and set the value of the original input to the generated LaTeX.

Once your input element(s) have been loaded into the DOM, call the `GUIMath.createEquationInput()` static method.

```javascript
GUIMath.createEquationInput('.my-equation-input');
```

`GUIMath.createEquationInput()` takes a CSS selector as an argument. It converts all elements that match that selector into equation inputs. Make sure that the selector you pass only selects `<input type="text">` elements.

For customizing the appearance of the equation input element, see [form input HTML structure]({% link customizing/ui.md %}#form-input-html-structure).

See an example of using the GUIMath form input [here]({% link examples.md %}).

### Using The Editor Widget
To get started quickly, check one of the [examples]({% link examples.md %}).

GUIMath works by showing your users a button/clickable element prompting them to insert an equation. GUIMath attaches event listeners to these elements and shows the editor UI when they are clicked.

Once the user is done entering the equation, the editor UI disappears and a callback function that you supply is run. This callback function is where you can access the generated LaTeX for the expression the user just entered and handle however you need. The most common use case is to store it as LaTeX and/or render it on your page using MathJax.

Initialize GUIMath by creating a new GUIMath instance, which takes 3 parameters - a CSS selector, a callback function, and an options object.

```javascript
const guimath = new GUIMath('selector', function(latex, instance) {}, options={});
```

The selector is a CSS selector that should be able to select the elements you want users to click on to start entering an equation. GUIMath attaches click event listeners to all selected elements and shows the editor UI whenever they are clicked.

The callback function is a function that is run when the user is done entering the equation and clicks on the “✔” button. This is where you will be able to access the LaTeX for the equation. For more information on how you should write a callback function, see [writing a success callback]({% link api/guimath-instance.md %}#writing-a-success-callback).

You would build a minimal example as shown below. This example takes the LaTeX for the equation the user has created, appends it to the body, and typesets it using MathJax.

```html
<button id="guimath-button">Add Equation</button>
<div id="equation-output"></div>
<script>
    const eqnOutput = document.querySelector('#equation-output');
    
    const guimath = new GUIMath('#guimath-button');
    
    guimath.successCallback = function (latex, instance) {
        MathJax.typesetClear([eqnOutput]);
        eqnOutput.innerHTML += '$$' + latex + '$$' + '<br>';
        MathJax.typesetPromise([eqnOutput]).then(() => {});
    }
</script>
```

The API provided by the GUIMath instance is documented in [GUIMath Instance documentation]({% link api/guimath-instance.md %}).