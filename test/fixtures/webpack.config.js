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
	parseNodeVersion = require('parse-node-version');

// Import Webpack + Babel plugins - build depends on TEST_ENV
const isProduction = process.env.NODE_ENV === 'production',
	testEnv = (process.env.TEST_ENV || '').toLowerCase();
const [serverDirPath, clientPath] = {
	'': ['src/server/', 'src/client/index.js'],
	cjs: ['', 'index.js'],
	esm: ['es/', 'es/index.js'],
	umd: ['', `dist/umd/index${isProduction ? '.min' : ''}.js`] // No server UMD builds so use CJS instead
}[testEnv];

// Use @babel/register to transpile ESM code during import
if (serverDirPath) {
	// Hack to prevent ERR_REQUIRE_ESM errors on Node 12.16.0+ and 13+.
	// Replaces Node's JS file loader with an identical version
	// but with check that leads to a ERR_REQUIRE_ESM error removed.
	// https://github.com/standard-things/esm/issues/868#issuecomment-594480715
	// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js#L1187
	const {major, minor} = parseNodeVersion(process.version);
	if (major > 12 || (major === 12 && minor >= 16)) {
		const Module = require('module'); // eslint-disable-line global-require
		Module._extensions['.js'] = function(module, filename) {
			const content = fs.readFileSync(filename, 'utf8');
			module._compile(content, filename);
		};
	}

	// eslint-disable-next-line global-require
	require('@babel/register')({
		// Defining root is required as without it @babel/register will not compile files
		// outside of working dir (test/fixtures)
		root: pathJoin(__dirname, '..', '..'),
		ignore: [/node_modules/]
	});
}

/* eslint-disable import/no-dynamic-require */
let ReactLazySsrWebpackPlugin = require(`../../${serverDirPath}webpack.js`),
	ReactLazySsrBabelPlugin = require(`../../${serverDirPath}babel.js`);
/* eslint-enable import/no-dynamic-require */

if (serverDirPath) {
	ReactLazySsrWebpackPlugin = ReactLazySsrWebpackPlugin.default;
	ReactLazySsrBabelPlugin = ReactLazySsrBabelPlugin.default;
}

// Exports

const mode = isProduction ? 'production' : 'development';

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
			// In UMD server-side fixtures, replace `react-lazy-ssr` with fake module `react-lazy-ssr-cjs`.
			// This is resolved by Jest config to CJS build.
			// See Jest config file for more details.
			testEnv === 'umd' ? {'react-lazy-ssr': 'react-lazy-ssr-cjs'} : 'react-lazy-ssr',
			'react',
			nodeExternals()
		],
		output: {
			path: pathJoin(fixtureDestPath, 'node'),
			filename: '[name].js',
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
				'react-lazy-ssr': pathJoin(__dirname, '../..', clientPath)
			}
		},
		output: {
			path: pathJoin(fixtureDestPath, 'web'),
			filename: '[name].js',
			publicPath: '/static/'
		},
		optimization: {splitChunks: {chunks: 'all'}},
		plugins: [new ReactLazySsrWebpackPlugin()],
		devtool: false
	});
}

module.exports = configs;
