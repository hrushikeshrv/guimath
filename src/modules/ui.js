// Draws the editor UI and canvas inside the given div
import * as ExpressionBackend from './expression-backend.js';
import Cursor from './cursor.js';
import editorHTML from '../html/editor.min.html';
import formHTML from '../html/form-input.min.html';

const symbolLatexMap = {
    // Lowercase greek letters
    alpha: '\\alpha',
    beta: '\\beta',
    gamma: '\\gamma',
    delta: '\\delta',
    epsilon: '\\epsilon',
    zeta: '\\zeta',
    eta: '\\eta',
    theta: '\\theta',
    iota: '\\iota',
    kappa: '\\kappa',
    lambda: '\\lambda',
    mu: '\\mu',
    nu: '\\nu',
    xi: '\\xi',
    omicron: '\\omicron',
    pi: '\\pi',
    rho: '\\rho',
    sigma: '\\sigma',
    tau: '\\tau',
    upsilon: '\\upsilon',
    phi: '\\phi',
    chi: '\\chi',
    psi: '\\psi',
    omega: '\\omega',

    // Uppercase greek letters
    Alpha: 'A',
    Beta: 'B',
    Gamma: '\\Gamma',
    Delta: '\\Delta',
    Epsilon: 'E',
    Zeta: 'Z',
    Eta: 'H',
    Theta: '\\Theta',
    Iota: 'I',
    Kappa: 'K',
    Lambda: '\\Lambda',
    Mu: 'M',
    Nu: 'N',
    Xi: '\\Xi',
    Omicron: 'O',
    Pi: '\\Pi',
    Rho: 'P',
    Sigma: '\\Sigma',
    Tau: 'T',
    Upsilon: '\\Upsilon',
    Phi: '\\Phi',
    Chi: 'X',
    Psi: '\\Psi',
    Omega: '\\Omega',

    // Operators and symbols
    times: '\\times',
    div: '\\div',
    centerdot: '\\cdot',
    plusmn: '\\pm',
    mnplus: '\\mp',
    starf: '\\star',
    bigcup: '\\bigcup',
    bigcap: '\\bigcap',
    cup: '\\cup',
    cap: '\\cap',
    lt: '\\lt',
    gt: '\\gt',
    leq: '\\leq',
    GreaterEqual: '\\geq',
    equals: '=',
    approx: '\\approx',
    NotEqual: '\\ne',
    sub: '\\subset',
    sup: '\\supset',
    sube: '\\subseteq',
    supe: '\\supseteq',
    nsub: '\\not\\subset',
    nsup: '\\not\\supset',
    nsube: '\\not\\subseteq',
    nsupe: '\\not\\supseteq',
    propto: '\\propto',
    parallel: '\\parallel',
    npar: '\\nparallel',
    asympeq: '\\asymp',
    isin: '\\in',
    notin: '\\notin',
    exist: '\\exists',
    nexist: '\\nexists',
    perp: '\\perp',
    angle: '\\angle',
    angmsd: '\\measuredangle',
    Leftarrow: '\\Leftarrow',
    Rightarrow: '\\Rightarrow',
    Leftrightarrow: '\\Leftrightarrow',
    rightarrow: '\\to',
    leftarrow: '\\gets',
    leftrightarrow: '\\leftrightarrow',
    longrightarrow: '\\longrightarrow',
    longleftarrow: '\\longleftarrow',
    longleftrightarrow: '\\longleftrightarrow',
    uparrow: '\\uparrow',
    downarrow: '\\downarrow',
    updownarrow: '\\updownarrow',
    PartialD: '\\partial',
    hbar: '\\hbar',
    real: '\\Re',
    nabla: '\\nabla',
    infin: '\\infty',
};

const functionComponentMap = {
    lim: ExpressionBackend.Limit,
    sqrt: ExpressionBackend.Sqrt,
    nsqrt: ExpressionBackend.NthRoot,
    sub: ExpressionBackend.Subscript,
    sup: ExpressionBackend.Superscript,
    subsup: ExpressionBackend.SubSupRight,
    frac: ExpressionBackend.Fraction,
};

export default class GUIMath {
    constructor(
        elementSelector,
        successCallback = function (latex, instance) {},
        options = {},
    ) {
        this.selector = elementSelector;
        this.elements = document.querySelectorAll(elementSelector);
        this.options = options;
        this.mathDelimiter = this.options.mathDelimiter || '$$';
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
        };
        this.hideUI = () => {
            // Hide the editor window
            this.editorWindow.removeAttribute('style');
            this.editorWindow.dataset.visible = 'false';
        };

        if (
            this.elements instanceof String ||
            typeof this.elements === 'string'
        ) {
            this.elements = document.querySelectorAll(this.elements);
        }

        this.constructUI();
        this.cursor = new Cursor(this.expression, this.eqnDisplay);
        this.elements.forEach(el => {
            el.addEventListener('click', this.showUI);
        });

        document.addEventListener('keydown', evt => {
            if (this.editorWindow.dataset.visible === 'false') return;
            MathJax.typesetClear([this.eqnDisplay]);
            this.cursor.keyPress(evt);
            this.eqnDisplay.innerHTML =
                this.mathDelimiter +
                this.cursor.toDisplayLatex() +
                this.mathDelimiter;
            MathJax.typesetPromise([this.eqnDisplay]).then(() => {});
        });

        const symbols = this.editorWindow.querySelectorAll(
            '.guimath-operator, .guimath-greek-letter',
        );
        const functions =
            this.editorWindow.querySelectorAll('.guimath-function');

        symbols.forEach(symbol => {
            symbol.addEventListener('click', () => {
                if (symbol.dataset.latexData in symbolLatexMap) {
                    let _ = new ExpressionBackend.GUIMathSymbol(
                        this.cursor.block,
                        symbolLatexMap[symbol.dataset.latexData],
                    );
                    this.cursor.addComponent(_);
                    this.cursor.updateDisplay();
                }
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
        this.eqnDisplay = editorDiv.querySelector('._guimath_editor_display');
        this.eqnDisplay.innerHTML = `${this.mathDelimiter} | ${this.mathDelimiter}`;

        this.pseudoMobileKeyboard = editorDiv.querySelector(
            '.guimath-pseudo-mobile-keyboard',
        );
        const guimathTabButtons = editorDiv.querySelectorAll(
            '.guimath_tab_container',
        );
        const guimathTabs = editorDiv.querySelectorAll('.guimath_tab');

        const leftArrowButton = editorDiv.querySelector('.leftArrowButton');
        const rightArrowButton = editorDiv.querySelector('.rightArrowButton');

        leftArrowButton.addEventListener('click', () => {
            this.cursor.seekLeft();
            this.cursor.updateDisplay();
        });

        rightArrowButton.addEventListener('click', () => {
            this.cursor.seekRight();
            this.cursor.updateDisplay();
        });

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
            '.guimath_close_button_svg',
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
     @param typeset true if MathJax should typeset buttonContent
      (requires MathJax to be completely loaded when this function is called)
     */
    registerFunction(
        componentClass,
        buttonContent,
        title = '',
        typeset = false,
    ) {
        const el = document.createElement('span');
        el.classList.add('guimath-btn', 'guimath-function');
        el.title = title;
        el.dataset.templateType = 'user-defined';
        el.dataset.functionId = 'user-defined';
        el.innerHTML = buttonContent;
        this.editorWindow
            .querySelector('._guimath_functions_tab')
            .appendChild(el);
        if (typeset) MathJax.typesetPromise([el]).then(() => {});

        el.addEventListener('click', () => {
            this.cursor.addComponent(new componentClass());
            this.cursor.updateDisplay();
        });
    }

    /**
     * Adds a symbol to the UI that is not supported out of the box.
     @param latexData LaTeX code for the symbol
     @param buttonContent HTML or text content that will be placed inside the rendered button
     @param title The title to show when a user hovers over the button
     @param typeset true if MathJax should typeset buttonContent
      (requires MathJax to be completely loaded when this function is called)
     */
    registerSymbol(latexData, buttonContent, title = '', typeset = false) {
        const el = document.createElement('span');
        el.classList.add('guimath-btn', 'guimath-symbol');
        el.title = title;
        el.dataset.latexData = latexData;
        el.innerHTML = buttonContent;
        this.editorWindow
            .querySelector('._guimath_symbols_tab')
            .appendChild(el);
        if (typeset) MathJax.typesetPromise([el]).then(() => {});

        el.addEventListener('click', () => {
            let _ = new ExpressionBackend.GUIMathSymbol(
                this.cursor.block,
                latexData,
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
                    MathJax.typesetClear([eqnDisplay]);
                    eqnDisplay.innerHTML = `$ ${latex} $`;
                    MathJax.typesetPromise([eqnDisplay]).then(() => {});

                    inpButton.textContent = 'Edit';
                } else {
                    inp.value = '';
                    MathJax.typesetClear([eqnDisplay]);
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
