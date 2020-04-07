/* --------------------
 * react-lazy-ssr module
 * Test fixtures
 * Webpack config to build all fixtures
 * ------------------*/

'use strict';

// Modules
const fs = require('fs'),
	pathJoin = require('path').join,
	nodeExternals = require('webpack-node-externals'),
	ReactLazySsrWebpackPlugin = require('../../webpack.js'), // require('react-lazy-ssr/webpack');
	ReactLazySsrBabelPlugin = require('../../babel.js'); // require('react-lazy-ssr/babel');

// Exports

const isProduction = process.env.NODE_ENV === 'production',
	mode = isProduction ? 'production' : 'development';

const srcPath = pathJoin(__dirname, 'temp'),
	destPath = pathJoin(__dirname, 'build');

const fixtureNames = fs.readdirSync(srcPath)
	.filter(filename => fs.statSync(pathJoin(srcPath, filename)).isDirectory());

const getModuleOpts = (target, fixtureSrcPath) => ({
	rules: [
		{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					caller: {target},
					plugins: [
						[ReactLazySsrBabelPlugin, {rootPath: fixtureSrcPath}]
					]
				}
			}
		}
	]
});

const configs = [];
for (const fixtureName of fixtureNames) {
	const fixtureSrcPath = pathJoin(srcPath, fixtureName),
		fixtureDestPath = pathJoin(destPath, fixtureName);

	// Node config
	configs.push({
		name: `${fixtureName} node`,
		target: 'node',
		mode,
		entry: pathJoin(fixtureSrcPath, 'App.jsx'),
		module: getModuleOpts('node', fixtureSrcPath),
		externals: [
			{
				'react-lazy-ssr': {
					commonjs2: pathJoin(__dirname, '..', '..', 'index.js')
				}
			},
			'react',
			nodeExternals()
		],
		output: {
			path: pathJoin(fixtureDestPath, 'node'),
			filename: isProduction ? '[name]-[chunkhash:8].js' : '[name].js',
			publicPath: '/static/',
			libraryTarget: 'commonjs2'
		},
		devtool: false
	});

	// Browser config
	configs.push({
		name: `${fixtureName} web`,
		target: 'web',
		mode,
		entry: pathJoin(fixtureSrcPath, 'client.jsx'),
		module: getModuleOpts('web', fixtureSrcPath),
		resolve: {
			alias: {
				'react-lazy-ssr': pathJoin(
					__dirname, '..', '..', 'dist', 'cjs', isProduction ? 'index.min.js' : 'index.js'
				)
			}
		},
		output: {
			path: pathJoin(fixtureDestPath, 'web'),
			filename: isProduction ? '[name]-[chunkhash:8].js' : '[name].js',
			publicPath: '/static/'
		},
		optimization: {splitChunks: {chunks: 'all'}},
		plugins: [new ReactLazySsrWebpackPlugin()],
		devtool: false
	});
}

module.exports = configs;
