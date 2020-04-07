/* --------------------
 * react-lazy-ssr module
 * CJS main entry point
 * Export dev or prod build based on NODE_ENV.
 * ------------------*/

/* eslint-disable global-require */

'use strict';

// Exports

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./dist/cjs/index.min.js');
} else {
	module.exports = require('./dist/cjs/index.js');
}
