/* --------------------
 * react-lazy-ssr module
 * CJS server entry point
 * Export dev or prod build based on NODE_ENV.
 * ------------------*/

/* eslint-disable global-require */

'use strict';

// Exports

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./dist/cjs/server.min.js');
} else {
	module.exports = require('./dist/cjs/server.js');
}
