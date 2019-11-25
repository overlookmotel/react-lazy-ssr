/* eslint-disable node/no-unpublished-require */

'use strict';

// Modules
const pathJoin = require('path').join,
	nodeExternals = require('webpack-node-externals'),
	ReactLazySsrPlugin = require('../webpack'); // require('react-lazy-ssr/webpack');

// Exports

const ENTRY_POINTS = {
	web: 'main-client.jsx',
	node: 'main-server.js'
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
		// TODO Find better way to do this
		externals: isNode ? [
			{
				'react-lazy-ssr': {
					commonjs2: pathJoin(__dirname, '../index.js')
				}
			},
			'react',
			'has-own-prop',
			nodeExternals()
		] : undefined,
		resolve: {
			alias: {
				'react-lazy-ssr': pathJoin(
					__dirname, '../dist', isProduction ? 'lazy.min.js' : 'lazy.js'
				)
			}
		},
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
