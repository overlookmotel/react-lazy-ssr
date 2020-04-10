/* --------------------
 * react-lazy-ssr module
 * Babel config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	// Compile ESM builds to CJS for testing with Jest.
	// These rules will never kick in outside tests.
	include: ['dist/esm', 'es', 'node_modules/@babel/runtime/helpers/esm/'],
	plugins: ['@babel/plugin-transform-modules-commonjs']
};
