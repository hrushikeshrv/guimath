// Builds the expression/equation being typed in by the user
// Exposes its API for the cursor module to use

/**
 * @class
 * Thin wrapper around the Component class that collects all the components together in an Expression
 * that can be easily rendered and converted to LaTeX.
 **/
class Expression {
    constructor(nestingDepth = 0) {
        this.components = [];
        this.nestingDepth = nestingDepth;
    }

    add(component, position = this.components.length) {
        // Insert component at position in this Expression.
        // Defaults to adding the component to the end of Expression
        this.components.splice(position, 0, component);
    }

    remove(position = this.components.length - 1) {
        // Remove the component at position in this Expression.
        // Defaults to removing the last component in this Expression
        this.components.splice(position, 1);
    }

    toLatex() {
        // Generate LaTeX code from the components in this Expression
        let latex = '';
        for (let c of this.components) {
            latex += c.toLatex() + ' ';
        }
        return latex.trim();
    }
}

/**
 * @class
 * Represents a block. A fundamental unit of the Expression.
 *
 * All data is ultimately stored in
 * a Block. A Component or any child class of Component has a fixed number of Blocks in it, and a Block can
 * have a variable number of 'children'. An element in a Block's children array can either be a string
 * or another Component, allowing for nesting of Components.
 */
class Block {
    constructor(parent) {
        /**
         * @param parent: The component to which this block belongs
         */
        this.children = [];
        this.parent = parent;
    }

    toLatex() {
        // Generate LaTeX code from the contents of this block.
        // A block's children can contain either strings or an arbitrary child class of Component.
        if (this.children.length === 0) return '';
        let latex = '';
        for (let c of this.children) {
            if (typeof c === 'string') {
                latex += c;
            } else {
                latex += c.toLatex() + ' ';
            }
        }
        return latex.trim();
    }

    addChild(component, position = this.children.length) {
        // Setter method to add some component to this block at position. Component can be any child class of Component.
        // Defaults to adding the component at the end.
        this.children.splice(position, 0, component);
    }

    removeChild(position = this.children.length - 1) {
        // Remove some component from this block.
        // Defaults to removing the last component.
        this.children.splice(position, 1);
    }
}

/**
 * @class
 * Base class representing a Component of the equation. Inherited by the TextComponent, all *Symbol,
 * and all *Function classes. All child classes of Component override the toLatex method
 * to customize the LaTeX generated. You can define your own child classes to add support for
 * LaTeX syntax not yet supported.
 */
class Component {
    constructor(blocks = [], parent = null) {
        /**
         * @param blocks: The blocks contained by the component
         * @param parent: The block the component is inside (if any), null if no parent
         */
        this.blocks = blocks;
        this.parent = parent;
    }

    toLatex() {
        return '';
    }

    addBlock(block, position) {
        this.blocks.splice(position, 0, block);
    }

    removeBlock(position) {
        this.blocks.splice(position, 1);
    }

    isEmpty() {
        // Returns true if the blocks in the component are empty
        for (let block of this.blocks) {
            if (block.children.length) return false;
        }
        return true;
    }
}

/**
 * @class
 * A component with one block
 */
class OneBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        super([b1], parent);
        b1.parent = this;
    }
}

/**
 * @class
 * A component with two blocks
 */
class TwoBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        let b2 = new Block();
        super([b1, b2], parent);
        b1.parent = this;
        b2.parent = this;
    }
}

/**
 * @class
 * A component with three blocks. We could further subclass ThreeBlockComponent to define a class that
 * takes in some LaTeX data, since that is mostly the only thing that varies between functions, and that would
 * make this file much DRYer
 */
class ThreeBlockComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        let b2 = new Block();
        let b3 = new Block();
        super([b1, b2, b3], parent);
        b1.parent = this;
        b2.parent = this;
        b3.parent = this;
    }
}

/**
 * @class
 * A template three block component that contains three blocks and uses the same LaTeX template.
 * Only the LaTeX command changes, but the template remains the same for every three block component.
 * We don't define a two block template component because the LaTeX generation for two block components
 * differs significantly from component to component.
 */
class TemplateThreeBlockComponent extends ThreeBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${
            this.latexData
        }_{${this.blocks[0].toLatex()}}^{${this.blocks[1].toLatex()}}{${this.blocks[2].toLatex()}}`;
    }
}

/**
 * @class
 * A template two block component for trigonometric functions, which all use the same LaTeX template.
 * Every trigonometric component will, by default, have an empty block as a superscript. MathJax removes the
 * empty block while rendering, so users will be able to raise the function to any power without us having to
 * define a separate template component to support exponents for trigonometric components.
 */
class TrigonometricTwoBlockComponent extends TwoBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${
            this.latexData
        }^{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}

/**
 * @class
 * A component with only text and no symbol, function of other LaTeX data. Safe to assume that
 * it only has one block with a string inside. Equivalent to a single block.
 */
class TextComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        super([b1], parent);
        b1.parent = this;
    }

    toLatex() {
        return this.blocks[0].toLatex();
    }
}

/**
 * @class
 * A symbol which is just some latex with no arguments to be inserted into the expression.
 */
// TODO - Add support for the backslash character as a symbol
class GuiMathSymbol extends Component {
    constructor(parent, latexData) {
        super([], parent);
        this.latexData = latexData;
    }

    toLatex() {
        return this.latexData;
    }
}

/**
 * @class
 * A framebox
 */
class FrameBox extends OneBlockComponent {
    toLatex() {
        return `\\boxed{${this.blocks[0].toLatex()}}`;
    }
}

/**
 * @class
 * The limit function
 */
class Limit extends TwoBlockComponent {
    toLatex() {
        return `\\lim_{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}

/**
 * @class
 * A fraction
 */
class Fraction extends TwoBlockComponent {
    toLatex() {
        return `\\frac{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }
}

/**
 * @class
 * Subscript
 */
class Subscript extends TwoBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}`;
    }
}

/**
 * @class
 * Superscript
 */

class Superscript extends TwoBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}^{${this.blocks[1].toLatex()}}`;
    }
}

/**
 * @class
 * Some text with both a subscript as well as a superscript on the left side
 */
class SubSupRight extends ThreeBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}^{${this.blocks[2].toLatex()}}`;
    }
}

/**
 * @class
 * The square root function
 */
class Sqrt extends OneBlockComponent {
    toLatex() {
        return `\\sqrt{${this.blocks[0].toLatex()}}`;
    }
}

/**
 * @class
 * The nth root function
 */
class NthRoot extends TwoBlockComponent {
    toLatex() {
        return `\\sqrt[${this.blocks[0].toLatex()}]{${this.blocks[1].toLatex()}}`;
    }
}
