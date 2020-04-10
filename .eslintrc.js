/* --------------------
 * react-lazy-ssr module
 * ESLint config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	extends: [
		'@overlookmotel/eslint-config',
		'@overlookmotel/eslint-config-node'
	],
	rules: {
		'no-multi-assign': ['off']
	},
	overrides: [
		// ES modules files
		{
			files: ['./src/**'],
			parserOptions: {
				sourceType: 'module'
			},
			rules: {
				'node/no-unsupported-features/es-syntax': ['error', {ignores: ['modules']}]
			}
		},
		{
			files: ['./src/.babelrc.js'],
			parserOptions: {
				sourceType: 'script'
			},
			rules: {
				'node/no-unsupported-features/es-syntax': 'error'
			}
		},
		// Suppress errors where require build artefacts
		// or dependencies defined in `example/package.json`
		{
			files: ['./index.js', './server.js', './babel.js', './webpack.js', './example/**'],
			rules: {
				'import/no-unresolved': ['off'],
				'node/no-missing-require': ['off']
			}
		},
		{
			files: ['./es/*.js'],
			parserOptions: {
				sourceType: 'module'
			},
			rules: {
				'node/no-unsupported-features/es-syntax': ['error', {ignores: ['modules']}],
				'node/no-missing-import': 'off',
				'node/no-unpublished-import': 'off',
				'import/no-unresolved': 'off'
			}
		},
		// Example src React + ES modules
		{
			files: ['./example/src/client/*.jsx'],
			extends: [
				'@overlookmotel/eslint-config-react'
			],
			parserOptions: {
				sourceType: 'module'
			},
			rules: {
				'node/no-unsupported-features/es-syntax': ['error', {ignores: ['modules', 'dynamicImport']}],
				'node/no-missing-import': 'off'
			}
		}
	],
	globals: {
		BROWSER: 'readonly',
		__DEV__: true
	}
};
