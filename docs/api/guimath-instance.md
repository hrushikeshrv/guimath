---
layout: default
title: GUIMath Instance 
parent: API
nav_order: 1
---

# GUIMath Instance API
{: .no_toc }

1. TOC
{:toc}

# Constructor
The GUIMath constructor takes 1 required and 2 optional arguments -

1. `selector` - A CSS selector string that can select the elements GUIMath should be attached to. GUIMath attached event listeners to all elements selected by this string and shows the editor widget when these elements are clicked.
2. `successCallback` - A callback function that will be run when the user is done entering the equation and clicks on the “✔” button. This is where you will be able to access the LaTeX for the equation. For more information on how you should write a callback function, see [writing a success callback](#writing-a-success-callback). This argument is optional, and the success callback can also be set after the GUIMath instance has been created, instead of setting it in the constructor. 
3. `options` - An Object that configures the editor's behaviour. See [supported options](#options). This argument is optional.

## Options
Currently, the following options are supported -

| Option          | Data Type | Default value | Description                                                                                                                                                                                                                                   |
|-----------------|-----------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mathDelimiter` | String    | `"$$"`        | The math delimiter as configured when you load MathJax. Use the same delimiter you use for inserting equation blocks, not inline equations. Most commonly used block delimiter is "$$".                                                       |
| `theme`         | String    | `undefined`   | Pass theme as "dark" to render the GUIMath widget in dark colors. Any other value will default to light mode.                                                                                                                                 |
| `isPersistent`  | boolean   | `false`       | If `true`, the user-entered equation will not be deleted when the user clicks on the confirmation button and the success callback is run. Instead, the entered equation will persist and will be shown as is when the widget is opened again. |
| `class`         | String    | `""`          | Additional CSS class or classes to add to the GUIMath widget's root element. Multiple classes can be separated by spaces.                                                                                                                     |
| `id`            | String    | `""`          | Additional id to add to the GUIMath widget's root element.                                                                                                                                                                                    |

## Writing A Success Callback
The success callback you supply is run when the user is done entering an equation and clicks on the “✔” button. This is where you will be able to access the LaTeX for the entered equation, and handle it however you want. It is recommended to supply this function after creating an GUIMath instance instead of passing it to the constructor, just because supplying it later lets you use both regular functions and arrow functions as the callback without having to worry about `this` in context.

The success callback is passed two arguments - 

1. `latex` - The generated LaTeX for the expression created by the user at the time the success callback is called
2. `instance` - The GUIMath instance that was generating the equation.

You can then render the generated equation on the page using MathJax, store it on your server, or handle it any other way you want.

```javascript
const guimath = new GUIMath('.selector', options={ theme: 'dark' });
guimath.successCallback = function(latex, instance) {
    // Process generated LaTeX as you need
}
```
