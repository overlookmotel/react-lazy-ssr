/* --------------------
 * react-lazy-ssr module
 * Rollup config
 * ------------------*/

// Modules
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

// Constants
const globals = {react: 'React'};

// Exports

export default [
	// Browser production
	{
		input: 'src/index.js',
		output: {
			file: 'dist/lazy.min.js',
			name: 'lazy',
			format: 'umd',
			globals,
			exports: 'named',
			sourcemap: false
		},
		external: Object.keys(globals),
		plugins: [
			babel(getBabelOptions()),
			nodeResolve(),
			commonjs(),
			terser()
		]
	},
	// Browser dev
	{
		input: 'src/index.js',
		output: {
			file: 'dist/lazy.js',
			name: 'lazy',
			format: 'umd',
			globals,
			exports: 'named'
		},
		external: Object.keys(globals),
		plugins: [
			babel(getBabelOptions()),
			nodeResolve(),
			commonjs()
		]
	},
	// Server CJS
	{
		input: {
			index: 'src/index.js',
			server: 'src/server.js',
			babel: 'src/babel.js',
			webpack: 'src/webpack.js'
		},
		// Name shared files sensibly, not call them all "chunk"!
		manualChunks: {
			context: ['src/context.js'],
			constants: ['src/constants.js'],
			load: ['src/load.js']
		},
		output: {
			dir: 'lib',
			format: 'cjs',
			chunkFileNames: '[name].js'
		},
		external
	}
];

function external(id) {
	return !id.startsWith('.') && !id.startsWith('/');
}

function getBabelOptions() {
	return {
		exclude: '**/node_modules/**',
		runtimeHelpers: true,
		presets: [
			'@babel/preset-env',
			'@babel/preset-react'
		],
		plugins: [
			// All `for (... of ...) ...` loops are over arrays
			['@babel/plugin-transform-for-of', {assumeArray: true}]
		]
	};
}
