/* --------------------
 * react-lazy-ssr module
 * Source Babel config
 * ------------------*/

'use strict';

// Exports

module.exports = api => ({
	plugins: [
		// Replace `__DEV__` with `process.env.NODE_ENV !== 'production'`
		// and remove error messages from `invariant()` in production mode
		'dev-expression'
	],
	overrides: [
		// Compile client and shared code to ES5
		{
			exclude: 'server',
			presets: [
				['@babel/preset-env', {
					// Loose mode to reduce ponyfills
					loose: true,
					// If running tests, compile for current Node version
					...(api.env('test') && {targets: {node: 'current'}})
				}]
			],
			plugins: [
				// All `for (... of ...) ...` loops are over arrays
				['@babel/plugin-transform-for-of', {assumeArray: true}]
			]
		},
		// Compile server-side code from ESM to CJS when running tests.
		// Rollup will handle this itself when building.
		...(
			api.env('test')
				? [{
					include: 'server',
					plugins: ['@babel/plugin-transform-modules-commonjs']
				}]
				: []
		)
	]
});
