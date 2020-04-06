/* --------------------
 * react-lazy-ssr module
 * Example
 * Webpack config
 * ------------------*/

/* eslint-disable node/no-unpublished-require */

'use strict';

// Modules
const pathJoin = require('path').join,
	nodeExternals = require('webpack-node-externals'),
	ReactLazySsrPlugin = require('react-lazy-ssr/webpack');

// Exports

const ENTRY_POINTS = {
	web: 'client.jsx',
	node: 'App.jsx'
};

const isProduction = process.env.NODE_ENV === 'production';

function getConfig(target) {
	const isNode = target === 'node',
		isBrowserProduction = !isNode && isProduction;

	return {
		name: target,
		mode: isBrowserProduction ? 'production' : 'development',
		target,
		entry: `./src/client/${ENTRY_POINTS[target]}`,
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							caller: {target}
						}
					}
				}
			]
		},
		externals: isNode ? [nodeExternals()] : undefined,
		output: {
			path: pathJoin(__dirname, 'build', target),
			filename: isBrowserProduction ? '[name]-[chunkhash:8].js' : '[name].js',
			publicPath: '/static/',
			libraryTarget: isNode ? 'commonjs2' : undefined
		},
		optimization: isNode ? undefined : {splitChunks: {chunks: 'all'}},
		plugins: isNode ? undefined : [new ReactLazySsrPlugin()],
		devtool: isBrowserProduction ? undefined : false
	};
}

module.exports = [
	getConfig('web'),
	getConfig('node')
];
