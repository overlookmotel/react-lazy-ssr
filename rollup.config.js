/* --------------------
 * react-lazy-ssr module
 * Rollup config
 * ------------------*/

'use strict';

// Modules
const pathJoin = require('path').join,
	nodeResolve = require('@rollup/plugin-node-resolve'),
	commonjs = require('@rollup/plugin-commonjs'),
	babel = require('rollup-plugin-babel'),
	{terser} = require('rollup-plugin-terser'),
	replace = require('@rollup/plugin-replace'),
	copy = require('rollup-plugin-copy');

// Exports

const globals = {react: 'React'};

// Get build formats
// Use `BUILD_ENV` to build only specific formats
// e.g. `BUILD_ENV=cjs npm run build` or `BUILD_ENV=cjs,esm npm run build`
const formats = getFormats(['cjs', 'esm', 'umd']);

// Create build configs
const configs = [];
for (const format of formats) {
	configs.push(
		createConfig(format, 'production'),
		createConfig(format, 'development')
	);
}

module.exports = configs;

function createConfig(format, env) {
	const isProduction = env === 'production',
		isUmd = format === 'umd',
		isEsm = format === 'esm';

	return {
		input: isUmd ? 'src/index.js' : ['src/index.js', 'src/server.js', 'src/babel.js', 'src/webpack.js'],
		output: {
			dir: `dist/${format}`,
			entryFileNames: isProduction ? '[name].min.js' : '[name].js',
			chunkFileNames: isProduction ? '[name].min.js' : '[name].js',
			name: 'ReactLazySsr',
			format,
			// Include all external modules except React in UMD build,
			// include none in CJS + ESM builds
			globals: isUmd ? globals : undefined,
			sourcemap: true
		},
		external: isUmd ? Object.keys(globals) : isExternalModule,
		plugins: [
			babel({
				exclude: /node_modules/,
				sourceMaps: true,
				// require/import runtime helpers (ponyfills) in CJS + ESM builds
				runtimeHelpers: !isUmd,
				plugins: !isUmd
					? [['@babel/transform-runtime', {useESModules: isEsm}]]
					: undefined
			}),
			isUmd ? nodeResolve() : undefined,
			isUmd ? commonjs({
				include: /node_modules/,
				namedExports: {'react-async-ssr/symbols': ['NO_SSR', 'ABORT', 'ON_MOUNT']}
			}) : undefined,
			replace({
				// Set NODE_ENV to strip out __DEV__ code-fenced code in production builds
				'process.env.NODE_ENV': JSON.stringify(env)
			}),
			isProduction ? terser() : undefined,
			isEsm ? copy({targets: [{src: 'es/package.json', dest: 'dist/esm'}]}) : undefined
		]
	};
}

function isExternalModule(moduleId) {
	return !moduleId.startsWith('.') && !moduleId.startsWith(pathJoin(__dirname, 'src'));
}

function getFormats(allFormats) {
	const formatsStr = process.env.BUILD_ENV;

	// Default = all formats
	if (!formatsStr) return allFormats;

	// Parse list of formats
	// eslint-disable-next-line no-shadow
	const formats = formatsStr.split(',').map(format => format.toLowerCase());
	const invalidFormat = formats.find(format => format !== 'all' && !allFormats.includes(format));
	if (invalidFormat != null) {
		throw new Error(`Unrecognised BUILD_ENV format '${invalidFormat}' - supported formats are ${allFormats.map(format => `'${format}'`).join(', ')} or 'all'`);
	}

	if (formats.includes('all')) return allFormats;

	return formats;
}
