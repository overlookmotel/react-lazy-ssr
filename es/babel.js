/* --------------------
 * react-lazy-ssr module
 * ESM Babel plugin entry point
 * Re-export in tree-shakable form, choosing dev or prod build based on NODE_ENV.
 * ------------------*/

// Imports
import babelProd from '../dist/esm/babel.min.js';
import babelDev from '../dist/esm/babel.js';

// Exports

export default process.env.NODE_ENV === 'production' ? babelProd : babelDev;
