---
layout: default
title: Custom Functions & Symbols
parent: Customizing
nav_order: 1
---

# Custom Functions & Symbols
{: .no_toc }
GUIMath lets you add support for functions and/or symbols that are not already present in the editor widget.

1. TOC
{:toc}

## Adding A Custom Symbol
To add a symbol to the editor widget that is not already present, you will need the following information -

1. The LaTeX representation of the symbol
2. The HTML representation of the symbol (to show in the editor widget)
3. The name of the tab in the editor where this symbol should be added 

The GUIMath editor has multiple tabs, and you can add your custom symbol to any tab. The tabs are identified by their name, and you should pass one of:

- `"greek-letters"`
- `"double-struck-fraktur"`
- `"arithmetic-operators"`
- `"relational-operators"`
- `"functions"`
- `"arrows"`
- `"scripts-brackets"`

Once you create a GUIMath instance, call the `registerSymbol()` method on the GUIMath instance to add the symbol you want.

### Example: Adding &there4; to the editor
For example, lets say you want to add the ∴ symbol to the editor widget under the `"relational-operators"` tab. In LaTeX, you can use the `\therefore` command to render a ∴ symbol, and the HTML code for it is `&there4`;

`registerSymbol()` takes 4 required arguments -

1. `latexData` - The LaTeX representation of the symbol, in this case `"\therefore"`. Required.
2. `buttonContent` - The HTML representation of the symbol, in this case `"&there4;"`. This HTML representation can be a simple string, an SVG, some custom HTML, an HTML character code, etc. Required.
3. `title` - A string that will be set as the title attribute of the rendered button. Required.
4. `tabName` - The name of the tab in the editor where this symbol should be added. See above for allowed tab names. Required.

```javascript
const guimath = new GUIMath('#guimath-button');
guimath.successCallback = function (latex, instance) {
    // Handle user input here 
}

guimath.registerSymbol('\\therefore', '&there4;', 'Therefore', "relational-operators");
```
You can see this example [here](../examples/add-custom-symbol.html).

## Adding A Custom Function
Adding a function to the editor widget is a little different from adding a symbol. A function needs to know how its LaTeX should be generated, since it is not static LaTeX like a symbol. To add a function that is not already present, you will need -

1. A class that knows how to generate the LaTeX you need for your function
2. An HTML representation of the function (to show in the editor widget)
3. The name of the tab in the editor where this function should be added

The GUIMath editor has multiple tabs, and you can add your custom symbol to any tab. The tabs are identified by their name, and you should pass one of:

- `"greek-letters"`
- `"double-struck-fraktur"`
- `"arithmetic-operators"`
- `"relational-operators"`
- `"functions"`
- `"arrows"`
- `"scripts-brackets"`

You will need to create a class that extends from one of GUIMath's many Component classes, and override the `toLatex()` method of the class. You can find a list of Component classes GUIMath provides, along with when to use them in the [Components documentation]({% link api/components.md %}).

Once you create this class and a GUIMath instance, call the `registerFunction()` method on the GUIMath instance to add the function you want.

### Example: Adding $ sin^2 \boxed{} $ to the editor
For example, let's say you want to add the $ sin^2 \boxed{} $ function to the editor.

`registerFunction()` takes 4 required arguments -

1. `componentClass` - A class inheriting from one of GUIMath's many component classes, which knows how to render it's content as LaTeX. Required. See [writing your own components]({% link api/components.md %}#writing-your-own-components).
2. `buttonContent` - The HTML representation of the function. This can be a simple string, an SVG, some custom HTML, an HTML character code, etc. Required. 
3. `title` - A string that will be set as the title attribute of the rendered button. Required.
4. `tabName` - The name of the tab in the editor where this symbol should be added. See above for allowed tab names. Required.

```javascript
// Create the class that knows how to render sin^2 as LaTeX
class SinSquaredComponent extends OneBlockComponent {
    toLatex() {
        return `\\sin^{2}{${this.blocks[0].toLatex()}}`;
    }
    
    toHTML(cursorBlock, cursorPosition) {
        return `
            <div class="_guimath_component _guimath_flexbox_row">
                <div class='_guimath_block' style="font-style: normal;">sin</div>
                <div class='_guimath_block _guimath_small_block' style="top: -0.5em">2</div>
                <div class='_guimath_block'>${this.blocks[0].toHTML(cursorBlock, cursorPosition)}</div>
            </div>
        `;
    }
}

// Create a GUIMath instance
const guimath = new GUIMath('#guimath-button');
guimath.successCallback = function (latex, instance) {
    // Handle user input here 
};

guimath.registerFunction(
    componentClass = SinSquaredComponent,
    buttonContent = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
        <msup>
            <mi>sin</mi>
            <mn>2</mn>
        </msup>
    </math>`,
    title = "Sine squared",
    tabName = "functions"
);
```
You can see this example [here](../examples/add-custom-function.html).
