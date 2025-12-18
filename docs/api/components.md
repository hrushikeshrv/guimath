---
layout: default
title: Components
parent: API
nav_order: 2
---

# GuiMath Components & Blocks
{: .no_toc }
GuiMath has several Component classes which define how LaTeX is generated.

1. TOC
{:toc}

# What Are Components?
Each object you insert as part of an equation - a character, symbol, function, etc. corresponds to a particular Component class. For example, consider the equation

$$ z = \frac{x}{y} $$

Internally, this equation is made up of multiple `Component`s. Each character is represented by a `TextComponent` class, in this case, the characters "z", "x", and "y". Moreover, the fraction is represented by its own `Fraction` component class. 

Each component is made up of blocks. A block is just a generic container that represents a part of the component. For example, the `TextComponent` has only one block which stores the character it is representing. The `Fraction` class has two blocks - one stores the content of the numerator and the other stores the content of the denominator. Each block can store a single character (as in case of the `TextComponent`'s block) or another component class, allowing for nesting components.

![GuiMath Structure](../media/guimath-structure.svg)

# Writing Your Own Components
If you want to add a function to the editor widget that is not present out of the box, you will need to write a component class that will inherit from one of GuiMath's built-in component classes. You will then have to override the `toLatex()` method of the class to define how the LaTeX should be generated for your component.

To identify which component class you should inherit from, determine how many blocks your function has. For example, a fraction has two blocks - the numerator and the denominator, and the square root function has just one block. As a guideline, you can usually consider each `{}` in the LaTeX representation of a function as a block - fraction is written as `\frac{}{}`, therefore it has 2 blocks, and square root is written as `\sqrt{}`, and therefore has only 1 block.

Once you determine which component class to inherit from, you will need to override the `toLatex()` method. This is where you will be able to define how the LaTeX is generated for your function. Inside the `toLatex()` method, you can access the `blocks` attribute of the instance, and call `toLatex()` for each block to construct the final LaTeX expression step-by-step. There is an example implementation under each heading below to demonstrate.

## One Block Component
Inherit from this class if your function has one block. Examples of functions which have one block include $ \sqrt{\boxed{}} $, $ \sin{\boxed{}} $, $ \sin^{2}{\boxed{}} $, etc.

### Inheritance Example: $ \sin^{2}{\boxed{}} $
```javascript
class SinSquaredComponent extends OneBlockComponent {
    toLatex() {
        return `\\sin^{2}{${this.blocks[0].toLatex()}}`;
    }
}
```

## Two Block Component
Inherit from this class if your function has two blocks. Examples of functions which have two blocks include $ \frac{\boxed{}}{\boxed{}} $, $ \sqrt[\boxed{}]{\boxed{}} $, etc.

### Inheritance Example: $ \frac{\boxed{}}{\boxed{}} $
```javascript
class Fraction extends TwoBlockComponent {
    toLatex() {
        return `\\frac{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}
```

## Three Block Component
Inherit from this class if your function has three blocks. Examples of functions which have three blocks include $ \sum_{\boxed{}}^{\boxed{}}{\boxed{}} $, $ \int_{\boxed{}}^{\boxed{}}{\boxed{}} $, etc.

### Inheritance Example: $ \left.\frac{\boxed{}}{\boxed{}}\right|_{\boxed{}} $
```javascript
class OneSidedFence extends ThreeBlockComponent {
    toLatex() {
        return `\\left.\\frac{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}\\right|_{${this.blocks[2].toLatex()}}`;
    }
}
```

## Base Component Class
Inherit from this class if your function has more than three blocks.