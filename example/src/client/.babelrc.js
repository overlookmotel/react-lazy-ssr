'use strict';

// Modules
const LazyPlugin = require('../../../babel'); // require('react-lazy-ssr/babel');

// Exports
module.exports = {
	presets: [
		'@babel/preset-env',
		'@babel/preset-react'
	],
	plugins: [
		'@babel/plugin-syntax-dynamic-import',
		[LazyPlugin, {rootPath: __dirname}]
	]
};
