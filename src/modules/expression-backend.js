// Builds the expression/equation being typed in by the user
// Exposes its API for the cursor module to use

/**
 * Helper function to determine if a string is a number
 * @param str
 * @returns {boolean}
 */
function isNumber(str) {
    if (typeof str != 'string') return false;
    return !isNaN(str) && !isNaN(parseFloat(str)) && isFinite(Number(str));
}

/**
 * @class
 * Thin wrapper around the Component class that collects all the components together in an Expression
 * that can be easily rendered and converted to LaTeX.
 **/
export class Expression {
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

    /**
     * Render the expression to HTML for display in the GUI
     */
    toHTML(cursorBlock = null, cursorPosition = null) {
        let html = '';
        for (let c of this.components) {
            html += c.toHTML(cursorBlock, cursorPosition) + ' ';
        }
        return this._postprocessHTML(html.trim());
    }

    /**
     * Postprocess the HTML generated to add any additional features
     * @param html
     * @private
     */
    _postprocessHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const activeBlock = doc.querySelector('._guimath_active_block_marker');
        if (!activeBlock) return doc.body.innerHTML;

        activeBlock.parentElement.classList.add('_guimath_active_block');
        activeBlock.remove();
        return doc.body.innerHTML;
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
export class Block {
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

    /**
     * Render the block to HTML for display in the GUI
     */
    toHTML(cursorBlock = null, cursorPosition = null) {
        if (this.children.length === 0) {
            if (this === cursorBlock)
                return '<span class="_guimath_cursor"></span>';
            return '';
        }
        let html = '';
        if (this === cursorBlock) {
            // This span is removed in postprocessing
            html += "<span class='_guimath_active_block_marker'></span>";
        }
        for (let i = 0; i < this.children.length; i++) {
            let c = this.children[i];
            if (Math.ceil(cursorPosition) === i && this === cursorBlock) {
                html += '<span class="_guimath_cursor"></span>';
            }
            if (typeof c === 'string') {
                html += c;
            } else {
                html += c.toHTML(cursorBlock, cursorPosition) + ' ';
            }
        }
        if (
            Math.ceil(cursorPosition) === this.children.length &&
            this === cursorBlock
        ) {
            html += '<span class="_guimath_cursor"></span>';
        }
        return html.trim();
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
export class Component {
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

    toHTML(cursorBlock = null, cursorPosition = null) {
        let html = '<div class="_guimath_component">';
        for (let block of this.blocks) {
            if (block === cursorBlock) {
                html += '<div class="_guimath_active_block _guimath_block">';
            } else html += '<div class="_guimath_block">';
            html += block.toHTML(cursorBlock, cursorPosition);
            html += '</div>';
        }
        html += '</div>';
        return html;
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
export class OneBlockComponent extends Component {
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
export class TwoBlockComponent extends Component {
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
export class ThreeBlockComponent extends Component {
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
export class TemplateThreeBlockComponent extends ThreeBlockComponent {
    constructor(parent, latexData, htmlData) {
        super(parent);
        this.latexData = latexData;
        this.htmlData = htmlData;
    }

    toLatex() {
        return `\\${
            this.latexData
        }_{${this.blocks[0].toLatex()}}^{${this.blocks[1].toLatex()}}{${this.blocks[2].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        if (
            this.parent !== null &&
            this.parent.parent !== null &&
            this.parent.parent instanceof Component
        ) {
            return `
                <div class="_guimath_component _guimath_flexbox_row">
                    <div class='_guimath_block _guimath_large_block' style="margin-right: 0;">${
                        this.htmlData
                    }</div>
                    <div class='_guimath_flexbox_column'>
                        <div class='_guimath_block _guimath_small_block'>${this.blocks[1].toHTML(
                            cursorBlock,
                            cursorPosition,
                        )}</div>
                        <div class='_guimath_block _guimath_small_block'>${this.blocks[0].toHTML(
                            cursorBlock,
                            cursorPosition,
                        )}</div>
                    </div>
                    <div class='_guimath_block'>${this.blocks[2].toHTML(
                        cursorBlock,
                        cursorPosition,
                    )}</div>
                </div>
            `;
        }
        return `
        <div class="_guimath_component _guimath_flexbox_row">
            <div class="_guimath_flexbox_column">
                <div class='_guimath_block _guimath_small_block'>${this.blocks[1].toHTML(
                    cursorBlock,
                    cursorPosition,
                )}</div>
                <div class='_guimath_block _guimath_large_block'>${
                    this.htmlData
                }</div>
                <div class='_guimath_block _guimath_small_block'>${this.blocks[0].toHTML(
                    cursorBlock,
                    cursorPosition,
                )}</div>
            </div>
            <div class='_guimath_block'>${this.blocks[2].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
        </div>
        `;
    }
}

/**
 * @class
 * A template two block component for trigonometric functions, which all use the same LaTeX template.
 * Every trigonometric component will, by default, have an empty block as a superscript. MathJax removes the
 * empty block while rendering, so users will be able to raise the function to any power without us having to
 * define a separate template component to support exponents for trigonometric components.
 */
export class TrigonometricTwoBlockComponent extends TwoBlockComponent {
    constructor(parent, latexData) {
        super(parent);
        this.latexData = latexData;
    }

    toLatex() {
        return `\\${
            this.latexData
        }^{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <div class="_guimath_component _guimath_flexbox_row">
            <div class='_guimath_block' style="font-style: normal;">${
                this.latexData
            }</div>
            <div class='_guimath_block _guimath_small_block' style="top: -0.5em">${this.blocks[0].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
            <div class='_guimath_block'>${this.blocks[1].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
        </div>
        `;
    }
}

/**
 * @class
 * A component with only text and no symbol, function of other LaTeX data. Safe to assume that
 * it only has one block with a string inside. Equivalent to a single block.
 */
export class TextComponent extends Component {
    constructor(parent) {
        let b1 = new Block();
        super([b1], parent);
        b1.parent = this;
    }

    toLatex() {
        return this.blocks[0].toLatex();
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        const content = this.blocks[0].toHTML(cursorBlock, cursorPosition);
        return `<span class="_guimath_text ${
            isNumber(content) ? '_guimath_straight_text' : ''
        }">${content}</span>`;
    }
}

/**
 * @class
 * A symbol which is just some latex with no arguments to be inserted into the expression.
 */
// TODO - Add support for the backslash character as a symbol
export class GUIMathSymbol extends Component {
    constructor(parent, latexData, htmlData) {
        super([], parent);
        this.latexData = latexData;
        this.htmlData = htmlData;
    }

    toLatex() {
        return this.latexData;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `<span class="_guimath_symbol_html">${this.htmlData}</span>`;
    }
}

/**
 * @class
 * A framebox
 */
export class FrameBox extends OneBlockComponent {
    toLatex() {
        return `\\boxed{${this.blocks[0].toLatex()}}`;
    }
}

/**
 * @class
 * The limit function
 */
export class Limit extends TwoBlockComponent {
    toLatex() {
        return `\\lim_{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <div class="_guimath_component _guimath_flexbox_row">
            <div class='_guimath_flexbox_column' style='margin-right: 0.35em;'>
                <div class='_guimath_block' style="font-style: normal;">lim</div>
                <div class='_guimath_block _guimath_small_block'>${this.blocks[0].toHTML(
                    cursorBlock,
                    cursorPosition,
                )}</div>
            </div>
            <div class='_guimath_block'>${this.blocks[1].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
        </div>
        `;
    }
}

/**
 * @class
 * The Logarithm function
 */
export class Logarithm extends TwoBlockComponent {
    toLatex() {
        return `\\log_{${this.blocks[0].toLatex()}}{\\left(${this.blocks[1].toLatex()}\\right)}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        
        <div class="_guimath_component _guimath_flexbox_row">
            <div class='_guimath_block' style="font-style: normal;">log</div>
            <div class='_guimath_block _guimath_small_block' style="bottom: -0.5em">${this.blocks[0].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
            <div class='_guimath_block'><span class='_guimath_straight_text'>(</span>${this.blocks[1].toHTML(
                cursorBlock,
                cursorPosition,
            )}<span class='_guimath_straight_text'>)</span></div>
        </div>
        `;
    }
}

export class NaturalLogarithm extends OneBlockComponent {
    toLatex() {
        return `\\ln\\left(${this.blocks[0].toLatex()}\\right)`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <div class="_guimath_component _guimath_flexbox_row">
            <div class='_guimath_flexbox_column' style='margin-right: 0.35em;'>
                <div class='_guimath_block' style="font-style: normal;">ln</div>
            </div>
            <div class='_guimath_block'><span class='_guimath_straight_text'>(</span>${this.blocks[0].toHTML(
                cursorBlock,
                cursorPosition,
            )}<span class="_guimath_straight_text">)</span></div> 
        </div>
        `;
    }
}

export class Exponent extends OneBlockComponent {
    toLatex() {
        return `\\exp\\left(${this.blocks[0].toLatex()}\\right)`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <div class="_guimath_component _guimath_flexbox_row">
            <div class='_guimath_flexbox_column' style='margin-right: 0.35em;'>
                <div class='_guimath_block' style="font-style: normal;">exp</div>
            </div>
            <div class='_guimath_block'><span class='_guimath_straight_text'>(</span>${this.blocks[0].toHTML(
                cursorBlock,
                cursorPosition,
            )}<span class="_guimath_straight_text">)</span></div>
        </div>
        `;
    }
}

/**
 * @class
 * A fraction
 */
export class Fraction extends TwoBlockComponent {
    toLatex() {
        return `\\frac{${this.blocks[0].toLatex()}}{${this.blocks[1].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <div class="_guimath_component _guimath_flexbox_column">
            <div class='_guimath_block' style='border-bottom: 2px solid var(--default-font-color); padding-bottom: 0.35em;'>${this.blocks[0].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
            <div class='_guimath_block' style='padding-top: 0.05em;'>${this.blocks[1].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
        </div>
        `;
    }
}

/**
 * @class
 * Subscript
 */
export class Subscript extends TwoBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <div class='_guimath_component'>
            <div class='_guimath_block'>${this.blocks[0].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
            <div class='_guimath_block _guimath_small_block' style="top: 0.5em;">${this.blocks[1].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
        </div>
        `;
    }
}

/**
 * @class
 * Superscript
 */

export class Superscript extends TwoBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}^{${this.blocks[1].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <div class='_guimath_component'>
            <div class='_guimath_block'>${this.blocks[0].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
            <div class='_guimath_block _guimath_small_block' style="bottom: 0.5em;">${this.blocks[1].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
        </div>
        `;
    }
}

/**
 * @class
 * Some text with both a subscript as well as a superscript on the left side
 */
export class SubSupRight extends ThreeBlockComponent {
    toLatex() {
        return `{${this.blocks[0].toLatex()}}_{${this.blocks[1].toLatex()}}^{${this.blocks[2].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <div class='_guimath_component'>
            <div class='_guimath_block'>${this.blocks[0].toHTML(
                cursorBlock,
                cursorPosition,
            )}</div>
           <div class='_guimath_flexbox_column'>
               <div class='_guimath_block _guimath_small_block'>${this.blocks[1].toHTML(
                   cursorBlock,
                   cursorPosition,
               )}</div>
               <div class='_guimath_block _guimath_small_block'>${this.blocks[2].toHTML(
                   cursorBlock,
                   cursorPosition,
               )}</div>
           </div>
        </div>
        `;
    }
}

/**
 * @class
 * The square root function
 */
export class Sqrt extends OneBlockComponent {
    toLatex() {
        return `\\sqrt{${this.blocks[0].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <math class="_guimath_component _guimath_flexbox_row">
            <msqrt>
                <mtext>
                <div class='_guimath_block'>${this.blocks[0].toHTML(
                    cursorBlock,
                    cursorPosition,
                )}</div>
                </mtext>
            </msqrt> 
        </math>
        `;
    }
}

/**
 * @class
 * The nth root function
 */
export class NthRoot extends TwoBlockComponent {
    toLatex() {
        return `\\sqrt[${this.blocks[0].toLatex()}]{${this.blocks[1].toLatex()}}`;
    }

    toHTML(cursorBlock = null, cursorPosition = null) {
        return `
        <math class="_guimath_component _guimath_flexbox_row">
            <mroot>
                <mtext>
                <div class='_guimath_block'>${this.blocks[1].toHTML(
                    cursorBlock,
                    cursorPosition,
                )}</div>
                </mtext>
                <mn class='_guimath_block _guimath_small_block'>${this.blocks[0].toHTML(
                    cursorBlock,
                    cursorPosition,
                )}</mn>
            </mroot> 
        </math>
        `;
    }
}
