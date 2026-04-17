// Draws the editor UI and canvas inside the given div
import * as ExpressionBackend from './expression-backend.js';
import Cursor from './cursor.js';
import editorHTML from '../html/editor.min.html';
import formHTML from '../html/form-input.min.html';

const functionComponentMap = {
    lim: ExpressionBackend.Limit,
    log: ExpressionBackend.Logarithm,
    ln: ExpressionBackend.NaturalLogarithm,
    exp: ExpressionBackend.Exponent,
    sqrt: ExpressionBackend.Sqrt,
    nsqrt: ExpressionBackend.NthRoot,
    sub: ExpressionBackend.Subscript,
    sup: ExpressionBackend.Superscript,
    subsup: ExpressionBackend.SubSupRight,
    subsupleft: ExpressionBackend.SubSupLeft,
    frac: ExpressionBackend.Fraction,
};

const validEditorTabNames = [
    'greek-letters',
    'double-struck-fraktur',
    'arithmetic-operators',
    'relational-operators',
    'functions',
    'arrows',
    'scripts-brackets',
];

export default class GUIMath {
    constructor(
        elementSelector,
        successCallback = function (latex, instance) {},
        options = {},
    ) {
        this.selector = elementSelector;
        this.elements = document.querySelectorAll(elementSelector);
        this.options = options;
        this.isPersistent = options.isPersistent || false;
        this.successCallback = successCallback;
        this.eqnHistory = [];
        this.expression = new ExpressionBackend.Expression();
        this.isMobileDevice = 'ontouchstart' in document.documentElement;
        this.pseudoMobileKeyboard = null;
        this.showUI = () => {
            // Show the editor window
            this.editorWindow.style.display = 'block';
            this.editorWindow.dataset.visible = 'true';
            this.editorWindow.dataset.focused = 'true';
        };
        this.hideUI = () => {
            // Hide the editor window
            this.editorWindow.removeAttribute('style');
            this.editorWindow.dataset.visible = 'false';
            this.editorWindow.dataset.focused = 'false';
        };

        if (
            this.elements instanceof String ||
            typeof this.elements === 'string'
        ) {
            this.elements = document.querySelectorAll(this.elements);
        }

        this.constructUI();
        this.cursor = new Cursor(this.expression, this.eqnDisplay);
        this.eqnDisplay.innerHTML = this.cursor.toHTML();
        this.elements.forEach(el => {
            el.addEventListener('click', evt => {
                this.showUI();
                evt.stopPropagation();
            });
        });

        document.addEventListener('click', evt => {
            if (
                this.editorWindow.dataset.visible === 'true' &&
                this.editorWindow.dataset.focused === 'true'
            )
                this.editorWindow.dataset.focused = 'false';
        });
        this.editorWindow.addEventListener('click', evt => {
            this.editorWindow.dataset.focused = 'true';
            evt.stopPropagation();
        });
        document.addEventListener('keydown', evt => {
            if (
                this.editorWindow.dataset.visible === 'false' ||
                this.editorWindow.dataset.focused !== 'true'
            )
                return;
            this.cursor.keyPress(evt);
            this.cursor.updateDisplay();
        });

        const symbols = this.editorWindow.querySelectorAll(
            '._guimath_operator, ._guimath_greek_letter, ._guimath_double_struck_letter, ._guimath_fraktur_letter, ._guimath_arrow',
        );
        const functions =
            this.editorWindow.querySelectorAll('._guimath_function');
        const accents = this.editorWindow.querySelectorAll('._guimath_accent');
        const templateArrows = this.editorWindow.querySelectorAll(
            '._guimath_template_arrow',
        );
        const brackets =
            this.editorWindow.querySelectorAll('._guimath_bracket');

        symbols.forEach(symbol => {
            symbol.addEventListener('click', () => {
                let _ = new ExpressionBackend.GUIMathSymbol(
                    this.cursor.block,
                    symbol.dataset.latexData,
                    symbol.innerHTML,
                );
                this.cursor.addComponent(_);
                this.cursor.updateDisplay();
            });
        });

        functions.forEach(func => {
            func.addEventListener('click', () => {
                let _;
                if (func.dataset.templateType !== 'null') {
                    if (func.dataset.templateType === 'three') {
                        _ = new ExpressionBackend.TemplateThreeBlockComponent(
                            this.cursor.block,
                            func.dataset.latexData,
                            func.innerHTML,
                        );
                    } else if (func.dataset.templateType === 'trigonometric') {
                        _ =
                            new ExpressionBackend.TrigonometricTwoBlockComponent(
                                this.cursor.block,
                                func.dataset.latexData,
                            );
                    }
                } else {
                    _ = new functionComponentMap[func.dataset.functionId](
                        this.cursor.block,
                    );
                }
                this.cursor.addComponent(_);
                this.cursor.updateDisplay();
            });
        });

        accents.forEach(accent => {
            accent.addEventListener('click', () => {
                let _ = new ExpressionBackend.ScriptOneBlockComponent(
                    this.cursor.block,
                    accent.dataset.latexData,
                    accent.dataset.templateType,
                );
                this.cursor.addComponent(_);
                this.cursor.updateDisplay();
            });
        });

        templateArrows.forEach(templateArrow => {
            templateArrow.addEventListener('click', () => {
                let _ = new ExpressionBackend.ArrowTwoBlockComponent(
                    this.cursor.block,
                    templateArrow.dataset.arrowType,
                );
                this.cursor.addComponent(_);
                this.cursor.updateDisplay();
            });
        });

        brackets.forEach(bracket => {
            bracket.addEventListener('click', () => {
                let _ = new ExpressionBackend.BracketOneBlockComponent(
                    this.cursor.block,
                    bracket.dataset.bracketType,
                );
                this.cursor.addComponent(_);
                this.cursor.updateDisplay();
            });
        });
    }

    // Inject the editor HTML into the DOM
    constructUI() {
        // Injects the UI HTML into the DOM and binds the needed event listeners
        const editorDiv = document.createElement('div');
        editorDiv.classList.add('_guimath_editor_window');
        if (this.options['id']) {
            editorDiv.id = this.options.id;
        }
        if (this.options['class']) {
            editorDiv.classList.add(this.options['class']);
        }
        editorDiv.dataset.visible = 'false';
        editorDiv.dataset.focused = 'false';
        editorDiv.innerHTML = editorHTML;
        if (this.options.theme?.toLowerCase().trim() === 'dark') {
            editorDiv.classList.add('_guimath_dark_theme');
        } else if (this.options.theme?.toLowerCase().trim() === 'grey') {
            editorDiv.classList.add('_guimath_grey_theme');
        } else if (this.options.theme?.toLowerCase().trim() === 'dark-blue') {
            editorDiv.classList.add('_guimath_dark_blue_theme');
        } else if (this.options.theme?.toLowerCase().trim() === 'light-blue') {
            editorDiv.classList.add('_guimath_light_blue_theme');
        } else if (this.options.theme?.toLowerCase().trim() === 'dark-pink') {
            editorDiv.classList.add('_guimath_dark_pink_theme');
        } else if (this.options.theme?.toLowerCase().trim() === 'light-pink') {
            editorDiv.classList.add('_guimath_light_pink_theme');
        }

        this.editorWindow = editorDiv;
        this.eqnDisplay = editorDiv.querySelector('#_guimath_equation_display');

        this.pseudoMobileKeyboard = editorDiv.querySelector(
            '.guimath-pseudo-mobile-keyboard',
        );
        const guimathTabButtons = editorDiv.querySelectorAll(
            '._guimath_tab_container',
        );
        const guimathTabs = editorDiv.querySelectorAll('._guimath_tab');

        guimathTabButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                guimathTabs.forEach(tab => {
                    if (tab.dataset.tab === btn.dataset.tab) {
                        tab.style.display = 'flex';
                    } else {
                        tab.removeAttribute('style');
                    }
                });
            });
        });
        guimathTabButtons[0].classList.add('_guimath_active_tab');
        guimathTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                guimathTabButtons.forEach(tabBtn => {
                    tabBtn.classList.remove('_guimath_active_tab');
                });
                btn.classList.add('_guimath_active_tab');
            });
        });

        const closeEditor = editorDiv.querySelector(
            '._guimath_close_button_svg',
        );
        closeEditor.addEventListener('click', this.hideUI);

        const clearEquationButton = editorDiv.querySelector(
            '._guimath_clear_equation',
        );
        clearEquationButton.addEventListener('click', () => {
            this.clearEquation();
        });

        const saveEquationButton = editorDiv.querySelector(
            '._guimath_save_equation',
        );
        saveEquationButton.addEventListener('click', () => {
            this.successCallback(this.getLatex(), this);
            this.hideUI();
            if (!this.isPersistent) this.clearEquation();
        });

        document.body.appendChild(editorDiv);
    }

    // Remove the current expression from the display, add it to the history, create a new expression and reset
    // all cursor properties to defaults.
    clearEquation() {
        // push this entire expression onto the eqnHistory array so the user can access it again
        this.eqnHistory.push(this.expression);
        this.expression = new ExpressionBackend.Expression();
        this.cursor.expression = this.expression;
        this.cursor.block = null;
        this.cursor.component = null;
        this.cursor.child = -0.5;
        this.cursor.position = -0.5;
        this.cursor.latex = '';
        this.cursor.updateDisplay();
    }

    /**
     * Getter method that returns the LaTeX for the currently built
     * equation.
     * @returns String - The generated LaTeX.
     */
    getLatex() {
        return this.cursor.toLatex();
    }

    /**
     * Removes all GUIMath click listeners for the current selector,
     * selects DOM elements again, and rebinds GUIMath click listeners. Meant
     * to be called if the DOM changes after the GUIMath instance is created.
     */
    rebindListeners() {
        this.elements.forEach(el => {
            el.removeEventListener('click', this.showUI);
        });
        this.elements = document.querySelectorAll(this.selector);
        this.elements.forEach(el => {
            el.addEventListener('click', this.showUI);
        });
    }

    /**
     * Adds a function to the UI that is not supported out of the box.
     @param componentClass A class that inherits from one of GUIMath's many component classes
     @param buttonContent HTML or text content that will be placed inside the rendered button
     @param title The title to show when a user hovers over the button
     @param tabName The name of the tab where this symbol should be placed. Should be one of
        `["greek-letters", "double-struck-fraktur", "arithmetic-operators", "relational-operators", "functions", "arrows", "scripts-brackets"]`
     */
    registerFunction(componentClass, buttonContent, title, tabName) {
        if (!validEditorTabNames.includes(tabName)) {
            // Do nothing if tab name is invalid
            console.error(
                'GUIMath.registerFunction received invalid tab name. Tab name should be one of ["greek-letters", "double-struck-fraktur", "arithmetic-operators", "relational-operators", "functions", "arrows", "scripts-brackets"]',
            );
            return;
        }

        const el = document.createElement('span');
        el.classList.add('_guimath_btn', '_guimath_function');
        el.title = title;
        el.dataset.templateType = 'user-defined';
        el.dataset.functionId = 'user-defined';
        el.innerHTML = buttonContent;
        let tab = this.editorWindow.querySelector(
            `._guimath_tab[data-tab-name="${tabName}"]`,
        );
        if (tab.querySelectorAll('._guimath_grid')) {
            // Select the last _guimath_grid element inside `tab`
            let _ = tab.querySelectorAll('._guimath_grid');
            tab = _[_.length - 1];
        }
        tab.appendChild(el);

        el.addEventListener('click', () => {
            this.cursor.addComponent(new componentClass());
            this.cursor.updateDisplay();
        });
    }

    /**
     * Adds a symbol to the UI that is not supported out of the box.
     @param latexData LaTeX code for the symbol
     @param htmlData HTML or text content representing the symbol
     @param title The title to show when a user hovers over the button
     @param tabName The name of the tab where this symbol should be placed. Should be one of
        `["greek-letters", "double-struck-fraktur", "arithmetic-operators", "relational-operators", "functions", "arrows", "scripts-brackets"]`
     */
    registerSymbol(latexData, htmlData, title, tabName) {
        if (!validEditorTabNames.includes(tabName)) {
            // Do nothing if tab name is invalid
            console.error(
                'GUIMath.registerSymbol received invalid tab name. Tab name should be one of ["greek-letters", "double-struck-fraktur", "arithmetic-operators", "relational-operators", "functions", "arrows", "scripts-brackets"]',
            );
            return;
        }

        const el = document.createElement('span');
        el.classList.add('_guimath_btn', 'guimath-symbol');
        el.title = title;
        el.dataset.latexData = latexData;
        el.innerHTML = htmlData;
        let tab = this.editorWindow.querySelector(
            `._guimath_tab[data-tab-name="${tabName}"]`,
        );
        if (tab.querySelectorAll('._guimath_grid')) {
            // Select the last _guimath_grid element inside `tab`
            let _ = tab.querySelectorAll('._guimath_grid');
            tab = _[_.length - 1];
        }
        tab.appendChild(el);

        el.addEventListener('click', () => {
            let _ = new ExpressionBackend.GUIMathSymbol(
                this.cursor.block,
                latexData,
                htmlData,
            );
            this.cursor.addComponent(_);
            this.cursor.updateDisplay();
        });
    }

    /**
     * Transforms an <input> element into a button that allows users to enter an equation using GUIMath.
     * Stores the resulting LaTeX of the equation as the value of the input.
     * @param selector A CSS selector that identifies the input(s) to be converted
     * @param options An object of options for configuring the GUIMath widget
     */
    static createEquationInput(selector, options = {}) {
        if (options.isPersistent === undefined) options.isPersistent = true;
        const inputs = document.querySelectorAll(selector);
        const formInputHTML = formHTML;
        for (let i = 0; i < inputs.length; i++) {
            let inp = inputs[i];
            inp.style.display = 'none';
            inp.value = '';

            const newEl = document.createElement('div');
            newEl.classList.add('_guimath_equation_input_wrapper');
            newEl.innerHTML = formInputHTML;
            inp.insertAdjacentElement('afterend', newEl);

            const inputEl = newEl.querySelector('._guimath_equation_input');
            const inpButton = newEl.querySelector(
                '._guimath_insert_equation_button',
            );
            const eqnDisplay = newEl.querySelector(
                '._guimath_equation_input_preview',
            );
            inpButton.id = `_guimath_insert_equation_button_${i}`;

            const widget = new GUIMath(
                `#_guimath_insert_equation_button_${i}`,
                function () {},
                options,
            );
            widget.successCallback = function (latex, instance) {
                if (latex.length > 0) {
                    // Set input value and show equation preview
                    inp.value = latex;
                    eqnDisplay.innerHTML = `$ ${latex} $`;

                    inpButton.textContent = 'Edit';
                } else {
                    inp.value = '';
                    eqnDisplay.innerHTML = '';
                    inpButton.textContent = 'Add Equation';
                }

                if (inp.validity.valid) {
                    inputEl.classList.remove('_guimath_equation_input_invalid');
                    inputEl.classList.add('_guimath_equation_input_valid');
                } else {
                    inputEl.classList.add('_guimath_equation_input_invalid');
                    inputEl.classList.remove('_guimath_equation_input_valid');
                }
            };
        }
    }
}

GUIMath.ExpressionBackend = ExpressionBackend;
