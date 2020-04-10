/* --------------------
 * react-lazy-ssr module
 * Tests Babel config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	exclude: 'fixtures',
	presets: [
		// Compile for current Node version
		['@babel/preset-env', {targets: {node: 'current'}}],
		'@babel/preset-react'
	]
};
