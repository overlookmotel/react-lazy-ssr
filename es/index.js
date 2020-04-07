/* --------------------
 * react-lazy-ssr module
 * ESM main entry point
 * Re-export in tree-shakable form, choosing dev or prod build based on NODE_ENV.
 * ------------------*/

// Imports
import lazyProd from '../dist/esm/index.min.js';
import lazyDev from '../dist/esm/index.js';

// Exports

export default process.env.NODE_ENV === 'production' ? lazyProd : lazyDev;
