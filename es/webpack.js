/* --------------------
 * react-lazy-ssr module
 * ESM Webpack plugin entry point
 * Re-export in tree-shakable form, choosing dev or prod build based on NODE_ENV.
 * ------------------*/

// Imports
import webpackProd from '../dist/esm/webpack.min.js';
import webpackDev from '../dist/esm/webpack.js';

// Exports

export default process.env.NODE_ENV === 'production' ? webpackProd : webpackDev;
