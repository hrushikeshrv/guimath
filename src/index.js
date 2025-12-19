import GUIMath from './modules/ui.js';
import * as ExpressionBackend from './modules/expression-backend.js';

// Attach backend to the constructor
GUIMath.ExpressionBackend = ExpressionBackend;

export default GUIMath;
