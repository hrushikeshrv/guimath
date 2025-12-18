import GuiMath from './modules/ui.js';
import * as ExpressionBackend from './modules/expression-backend.js';

// Attach backend to the constructor
GuiMath.ExpressionBackend = ExpressionBackend;

export default GuiMath;
