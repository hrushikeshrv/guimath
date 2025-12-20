// Draws the editor UI and canvas inside the given div
import * as ExpressionBackend from './expression-backend.js';
import Cursor from './cursor.js';

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
        editorDiv.innerHTML =
            '<div class="guimath_editor_controls"><div style="cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" class="guimath_close_button_svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><div class="guimath_clear_save_buttons"><span class="guimath_button_container _guimath_clear_equation"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg> </span><span class="guimath_button_container _guimath_save_equation"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/></svg></span></div></div><div class="_guimath_tab_container_container"><div class="guimath_tab_container" data-tab="1">&alpha; Letters</div><div class="guimath_tab_container" data-tab="2">&plusmn; Symbols</div><div class="guimath_tab_container" data-tab="3">&Sigma; Functions</div></div><div class="guimath_tab _guimath_letters_tab" style="display: flex;" data-tab="1"><span class="guimath-btn guimath-greek-letter" title="Alpha" data-latex-data="Alpha">&Alpha;</span> <span class="guimath-btn guimath-greek-letter" title="Beta" data-latex-data="Beta">&Beta;</span> <span class="guimath-btn guimath-greek-letter" title="Gamma" data-latex-data="Gamma">&Gamma;</span> <span class="guimath-btn guimath-greek-letter" title="Delta" data-latex-data="Delta">&Delta;</span> <span class="guimath-btn guimath-greek-letter" title="Epsilon" data-latex-data="Epsilon">&Epsilon;</span> <span class="guimath-btn guimath-greek-letter" title="Zeta" data-latex-data="Zeta">&Zeta;</span> <span class="guimath-btn guimath-greek-letter" title="Eta" data-latex-data="Eta">&Eta;</span> <span class="guimath-btn guimath-greek-letter" title="Theta" data-latex-data="Theta">&Theta;</span> <span class="guimath-btn guimath-greek-letter" title="Iota" data-latex-data="Iota">&Iota;</span> <span class="guimath-btn guimath-greek-letter" title="Kappa" data-latex-data="Kappa">&Kappa;</span> <span class="guimath-btn guimath-greek-letter" title="Lambda" data-latex-data="Lambda">&Lambda;</span> <span class="guimath-btn guimath-greek-letter" title="Mu" data-latex-data="Mu">&Mu;</span> <span class="guimath-btn guimath-greek-letter" title="Nu" data-latex-data="Nu">&Nu;</span> <span class="guimath-btn guimath-greek-letter" title="Xi" data-latex-data="Xi">&Xi;</span> <span class="guimath-btn guimath-greek-letter" title="Omicron" data-latex-data="Omicron">&Omicron;</span> <span class="guimath-btn guimath-greek-letter" title="Pi" data-latex-data="Pi">&Pi;</span> <span class="guimath-btn guimath-greek-letter" title="Rho" data-latex-data="Rho">&Rho;</span> <span class="guimath-btn guimath-greek-letter" title="Sigma" data-latex-data="Sigma">&Sigma;</span> <span class="guimath-btn guimath-greek-letter" title="Tau" data-latex-data="Tau">&Tau;</span> <span class="guimath-btn guimath-greek-letter" title="Upsilon" data-latex-data="Upsilon">&Upsilon;</span> <span class="guimath-btn guimath-greek-letter" title="Phi" data-latex-data="Phi">&Phi;</span> <span class="guimath-btn guimath-greek-letter" title="Chi" data-latex-data="Chi">&Chi;</span> <span class="guimath-btn guimath-greek-letter" title="Psi" data-latex-data="Psi">&Psi;</span> <span class="guimath-btn guimath-greek-letter" title="Omega" data-latex-data="Omega">&Omega;</span> <span class="guimath-btn guimath-greek-letter" title="alpha" data-latex-data="alpha">&alpha;</span> <span class="guimath-btn guimath-greek-letter" title="beta" data-latex-data="beta">&beta;</span> <span class="guimath-btn guimath-greek-letter" title="gamma" data-latex-data="gamma">&gamma;</span> <span class="guimath-btn guimath-greek-letter" title="delta" data-latex-data="delta">&delta;</span> <span class="guimath-btn guimath-greek-letter" title="epsilon" data-latex-data="epsilon">&epsilon;</span> <span class="guimath-btn guimath-greek-letter" title="zeta" data-latex-data="zeta">&zeta;</span> <span class="guimath-btn guimath-greek-letter" title="eta" data-latex-data="eta">&eta;</span> <span class="guimath-btn guimath-greek-letter" title="theta" data-latex-data="theta">&theta;</span> <span class="guimath-btn guimath-greek-letter" title="iota" data-latex-data="iota">&iota;</span> <span class="guimath-btn guimath-greek-letter" title="kappa" data-latex-data="kappa">&kappa;</span> <span class="guimath-btn guimath-greek-letter" title="lambda" data-latex-data="lambda">&lambda;</span> <span class="guimath-btn guimath-greek-letter" title="mu" data-latex-data="mu">&mu;</span> <span class="guimath-btn guimath-greek-letter" title="nu" data-latex-data="nu">&nu;</span> <span class="guimath-btn guimath-greek-letter" title="xi" data-latex-data="xi">&xi;</span> <span class="guimath-btn guimath-greek-letter" title="omicron" data-latex-data="omicron">&omicron;</span> <span class="guimath-btn guimath-greek-letter" title="pi" data-latex-data="pi">&pi;</span> <span class="guimath-btn guimath-greek-letter" title="rho" data-latex-data="rho">&rho;</span> <span class="guimath-btn guimath-greek-letter" title="sigma" data-latex-data="sigma">&sigma;</span> <span class="guimath-btn guimath-greek-letter" title="tau" data-latex-data="tau">&tau;</span> <span class="guimath-btn guimath-greek-letter" title="upsilon" data-latex-data="upsilon">&upsilon;</span> <span class="guimath-btn guimath-greek-letter" title="phi" data-latex-data="phi">&phi;</span> <span class="guimath-btn guimath-greek-letter" title="chi" data-latex-data="chi">&chi;</span> <span class="guimath-btn guimath-greek-letter" title="psi" data-latex-data="psi">&psi;</span> <span class="guimath-btn guimath-greek-letter" title="omega" data-latex-data="omega">&omega;</span></div><div class="guimath_tab _guimath_symbols_tab" data-tab="2"><span class="guimath-btn guimath-operator" title="Times" data-latex-data="times">&times;</span> <span class="guimath-btn guimath-operator" title="Divide" data-latex-data="div">&div;</span> <span class="guimath-btn guimath-operator" title="Center dot" data-latex-data="centerdot">&centerdot;</span> <span class="guimath-btn guimath-operator" title="Plus-minus" data-latex-data="plusmn">&plusmn;</span> <span class="guimath-btn guimath-operator" title="Less than" data-latex-data="lt">&lt;</span> <span class="guimath-btn guimath-operator" title="Greater than" data-latex-data="gt">&gt;</span> <span class="guimath-btn guimath-operator" title="Less than or equal to" data-latex-data="leq">&leq;</span> <span class="guimath-btn guimath-operator" title="Greater than or equal to" data-latex-data="GreaterEqual">&GreaterEqual;</span> <span class="guimath-btn guimath-operator" title="Equals" data-latex-data="equals">&equals;</span> <span class="guimath-btn guimath-operator" title="Approximate" data-latex-data="approx">&approx;</span> <span class="guimath-btn guimath-operator" title="Not equal" data-latex-data="NotEqual">&NotEqual;</span> <span class="guimath-btn guimath-operator" title="Minus-plus" data-latex-data="mnplus">&mnplus;</span> <span class="guimath-btn guimath-operator" title="Star" data-latex-data="starf">&starf;</span> <span class="guimath-btn guimath-operator" title="Big cup" data-latex-data="bigcup">&bigcup;</span> <span class="guimath-btn guimath-operator" title="Big cap" data-latex-data="bigcap">&bigcap;</span> <span class="guimath-btn guimath-operator" title="Cup" data-latex-data="cup">&cup;</span> <span class="guimath-btn guimath-operator" title="Cap" data-latex-data="cap">&cap;</span> <span class="guimath-btn guimath-operator" title="Subset of" data-latex-data="sub">&sub;</span> <span class="guimath-btn guimath-operator" title="Superset of" data-latex-data="sup">&sup;</span> <span class="guimath-btn guimath-operator" title="Subset of or equal to" data-latex-data="sube">&sube;</span> <span class="guimath-btn guimath-operator" title="Superset of or equal to" data-latex-data="supe">&supe;</span> <span class="guimath-btn guimath-operator" title="Not a subset of" data-latex-data="nsub">&nsub;</span> <span class="guimath-btn guimath-operator" title="Not a superset of" data-latex-data="nsup">&nsup;</span> <span class="guimath-btn guimath-operator" title="Not a subset of or equal to" data-latex-data="nsube">&nsube;</span> <span class="guimath-btn guimath-operator" title="Not a superset of or equal to" data-latex-data="nsupe">&nsupe;</span> <span class="guimath-btn guimath-operator" title="Proportional to" data-latex-data="propto">&propto;</span> <span class="guimath-btn guimath-operator" title="Parallel to" data-latex-data="parallel">&parallel;</span> <span class="guimath-btn guimath-operator" title="Not parallel to" data-latex-data="npar">&npar;</span> <span class="guimath-btn guimath-operator" title="Approximately equal to" data-latex-data="asympeq">&asympeq;</span> <span class="guimath-btn guimath-operator" title="Element of" data-latex-data="isin">&isin;</span> <span class="guimath-btn guimath-operator" title="Not an element of" data-latex-data="notin">&notin;</span> <span class="guimath-btn guimath-operator" title="There exists" data-latex-data="exist">&exist;</span> <span class="guimath-btn guimath-operator" title="There does not exists" data-latex-data="nexist">&nexist;</span> <span class="guimath-btn guimath-operator" title="Perpendicular to" data-latex-data="perp">&perp;</span> <span class="guimath-btn guimath-operator" title="Implies (left)" data-latex-data="Leftarrow">&Leftarrow;</span> <span class="guimath-btn guimath-operator" title="Implies (right)" data-latex-data="Rightarrow">&Rightarrow;</span> <span class="guimath-btn guimath-operator" title="If and only if (iff)" data-latex-data="Leftrightarrow">&Leftrightarrow;</span> <span class="guimath-btn guimath-operator" title="Angle" data-latex-data="angle">&angle;</span> <span class="guimath-btn guimath-operator" title="Measured angle" data-latex-data="angmsd">&angmsd;</span> <span class="guimath-btn guimath-operator" title="Right arrow" data-latex-data="rightarrow">&rightarrow;</span> <span class="guimath-btn guimath-operator" title="Left arrow" data-latex-data="leftarrow">&leftarrow;</span> <span class="guimath-btn guimath-operator" title="Left right arrow" data-latex-data="leftrightarrow">&leftrightarrow;</span> <span class="guimath-btn guimath-operator" title="Long right arrow" data-latex-data="longrightarrow">&longrightarrow;</span> <span class="guimath-btn guimath-operator" title="Long left arrow" data-latex-data="longleftarrow">&longleftarrow;</span> <span class="guimath-btn guimath-operator" title="Long left right arrow" data-latex-data="longleftrightarrow">&longleftrightarrow;</span> <span class="guimath-btn guimath-operator" title="Up arrow" data-latex-data="uparrow">&uparrow;</span> <span class="guimath-btn guimath-operator" title="Down arrow" data-latex-data="downarrow">&downarrow;</span> <span class="guimath-btn guimath-operator" title="Up down arrow" data-latex-data="updownarrow">&updownarrow;</span> <span class="guimath-btn guimath-operator" title="Partial derivative" data-latex-data="PartialD">&PartialD;</span> <span class="guimath-btn guimath-operator" title="Reduced plank constant (h-bar)" data-latex-data="hbar">&hbar;</span> <span class="guimath-btn guimath-operator" title="Real part symbol" data-latex-data="real">&real;</span> <span class="guimath-btn guimath-operator" title="Nabla, del operator" data-latex-data="nabla">&nabla;</span> <span class="guimath-btn guimath-operator" title="Infinity symbol" data-latex-data="infin">&infin;</span></div><div class="guimath_tab _guimath_functions_tab" data-tab="3"><span class="guimath-btn guimath-function" title="Summation" data-template-type="three" data-latex-data="sum">&Sigma;</span> <span class="guimath-btn guimath-function" title="Integral" data-template-type="three" data-latex-data="int">&int;</span> <span class="guimath-btn guimath-function" title="Double integral" data-template-type="three" data-latex-data="iint">&#8748</span> <span class="guimath-btn guimath-function" title="Triple integral" data-template-type="three" data-latex-data="iiint">&iiint;</span> <span class="guimath-btn guimath-function" title="Contour integral" data-template-type="three" data-latex-data="oint">&oint;</span> <span class="guimath-btn guimath-function" title="Product" data-template-type="three" data-latex-data="prod">&Pi;</span> <span class="guimath-btn guimath-function" title="Co product" data-template-type="three" data-latex-data="coprod">&coprod;</span> <span class="guimath-btn guimath-function" title="Big cup (union)" data-template-type="three" data-latex-data="bigcup">&bigcup;</span> <span class="guimath-btn guimath-function" title="Big cap (intersection)" data-template-type="three" data-latex-data="bigcap">&bigcap;</span> <span class="guimath-btn guimath-function" title="Big vee (logical OR)" data-template-type="three" data-latex-data="bigvee">&bigvee;</span> <span class="guimath-btn guimath-function" title="Big wedge (logical AND)" data-template-type="three" data-latex-data="bigwedge">&bigwedge;</span> <span class="guimath-btn guimath-function" title="Limit" data-template-type="null" data-function-id="lim"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="500" font-weight="500" text-anchor="middle" transform="matrix(.75 0 0 .75 279.5 326.267)"><tspan x="0">lim</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Square root" data-template-type="null" data-function-id="sqrt"><svg viewBox="0 0 567 567"><defs><style>.cls-1,.cls-2{fill-rule:evenodd}.cls-1{stroke-width:4.667px}.cls-2{stroke-width:7.417px}</style></defs><path id="Line_1" d="M3.707 306.883l-1.73-2.643 41.9-27.427 1.73 2.642z" class="cls-1" data-name="Line 1"/><path id="Line_2" d="M47.233 275.65l1.831-1.045 80.1 140.4-1.831 1.044z" class="cls-1" data-name="Line 2"/><path id="Line_3" d="M129.569 410.274l-3.113-1.374 111.707-252.923 3.113 1.375z" class="cls-2" data-name="Line 3"/><path id="Line_4" d="M241.471 154.67v-1.746h322.563v1.746H241.471z" class="cls-2" data-name="Line 4"/><path fill="none" fill-rule="evenodd" stroke-width="10.125" d="M288.978 190.824H495.53v206.552H288.978V190.824z"/></svg></span><span class="guimath-btn guimath-function" title="Nth root" data-template-type="null" data-function-id="nsqrt"><svg viewBox="0 0 567 567"><defs><style>.cls-1,.cls-2,.cls-3{fill-rule:evenodd}.cls-1{stroke-width:4.667px}.cls-2{stroke-width:7.417px}.cls-3{fill:none;stroke-width:10.125px}</style></defs><path id="Line_1" d="M3.707 306.883l-1.73-2.643 41.9-27.427 1.73 2.642z" class="cls-1" data-name="Line 1"/><path id="Line_2" d="M47.233 275.65l1.831-1.045 80.1 140.4-1.831 1.044z" class="cls-1" data-name="Line 2"/><path id="Line_3" d="M129.569 410.274l-3.113-1.374 111.707-252.923 3.113 1.375z" class="cls-2" data-name="Line 3"/><path id="Line_4" d="M241.471 154.67v-1.746h322.563v1.746H241.471z" class="cls-2" data-name="Line 4"/><path d="M288.978 190.824H495.53v206.552H288.978V190.824z" class="cls-3"/><path id="Rectangle_1_copy" d="M69.42 178.744h90.512v90.512H69.42v-90.512z" class="cls-3" data-name="Rectangle 1 copy"/></svg></span><span class="guimath-btn guimath-function" title="Subscript" data-template-type="null" data-function-id="sub"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke-width:12.875px;fill-rule:evenodd}</style></defs><path d="M27.09 82.836h285.083v285.083H27.09V82.836z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 295.421h169.985V465.41H362.8V295.421z" class="cls-1" data-name="Rectangle 1 copy"/></svg></span><span class="guimath-btn guimath-function" title="Superscript" data-template-type="null" data-function-id="sup"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke-width:12.875px;fill-rule:evenodd}</style></defs><path d="M27.09 468.164h285.083V183.081H27.09v285.083z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 255.579h169.985V85.59H362.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/></svg></span><span class="guimath-btn guimath-function" title="Subscript and Superscript" data-template-type="null" data-function-id="subsup"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;stroke-width:12.875px;fill-rule:evenodd}</style></defs><path d="M34.7 413.554h267.862V145.693H34.7v267.861z" class="cls-1"/><path id="Rectangle_1_copy" d="M362.8 243.579h169.985V73.59H362.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/><path id="Rectangle_1_copy_2" d="M533.2 487.579H363.215V317.59H533.2v169.989z" class="cls-1" data-name="Rectangle 1 copy 2"/></svg></span><span class="guimath-btn guimath-function" title="Fraction" data-template-type="null" data-function-id="frac"><svg viewBox="0 0 567 567"><defs><style>.cls-1{fill:none;fill-rule:evenodd;stroke-width:12.875px}</style></defs><path id="Rectangle_1_copy" d="M193.8 225.579h169.985V55.59H193.8v169.989z" class="cls-1" data-name="Rectangle 1 copy"/><path id="Line_1" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="10.125" d="M124 284v-1h295v1H124z" data-name="Line 1"/><path id="Rectangle_1_copy_2" d="M364.2 528.579H194.215V358.59H364.2v169.989z" class="cls-1" data-name="Rectangle 1 copy 2"/></svg></span><span class="guimath-btn guimath-function" title="Sine" data-template-type="trigonometric" data-latex-data="sin"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">sin</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Cosine" data-template-type="trigonometric" data-latex-data="cos"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">cos</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Tangent" data-template-type="trigonometric" data-latex-data="tan"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">tan</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Cosecant" data-template-type="trigonometric" data-latex-data="csc"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">csc</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Secant" data-template-type="trigonometric" data-latex-data="sec"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">sec</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Cotangent" data-template-type="trigonometric" data-latex-data="cot"><svg viewBox="0 0 567 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="310.5" text-anchor="middle" transform="translate(286.022 367.216) scale(1.235)"><tspan x="0">cot</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Inverse sine" data-template-type="trigonometric" data-latex-data="arcsin"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arcsin</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Inverse cosine" data-template-type="trigonometric" data-latex-data="arccos"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arccos</tspan></text></svg></span><span class="guimath-btn guimath-function" title="Inverse tanget" data-template-type="trigonometric" data-latex-data="arctan"><svg width="45" height="20" viewBox="0 0 2000 567"><text fill="var(--default-font-color)" font-family="Cambria" font-size="500" text-anchor="middle" transform="matrix(1.5 0 0 1.5 973.5 496)"><tspan x="0">arctan</tspan></text></svg></span></div><div style="text-align: center;"><button class="_guimath_dir_btn leftArrowButton" style="cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-left" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/></svg></button> <button class="_guimath_dir_btn rightArrowButton" style="cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M13 18l6 -6"/><path d="M13 6l6 6"/></svg></button></div><div class="_guimath_editor_display"></div>';
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
        const formInputHTML =
            '<div class="_guimath_equation_input"><button type="button" class="_guimath_insert_equation_button">Add Equation</button><div class="_guimath_equation_input_preview"></div></div>';
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
