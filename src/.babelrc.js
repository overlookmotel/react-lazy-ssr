/* --------------------
 * react-lazy-ssr module
 * Source Babel config
 * ------------------*/

'use strict';

// Exports

module.exports = {
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
};
