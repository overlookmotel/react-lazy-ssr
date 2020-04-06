/* --------------------
 * react-lazy-ssr module
 * Tests Babel config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	presets: [
		['@babel/preset-env', {targets: {node: 'current'}}],
		'@babel/preset-react'
	]
};
