/* --------------------
 * react-lazy-ssr module
 * Source Babel config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	plugins: [
		// Replace `__DEV__` with `process.env.NODE_ENV !== 'production'`
		// and remove error messages from `invariant()` in production mode
		'dev-expression'
	],
	overrides: [{
		exclude: 'server',
		presets: [
			['@babel/preset-env', {
				// Loose mode to reduce ponyfills
				loose: true
			}]
		],
		plugins: [
			// All `for (... of ...) ...` loops are over arrays
			['@babel/plugin-transform-for-of', {assumeArray: true}]
		]
	}]
};
