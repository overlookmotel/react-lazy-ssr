'use strict';

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
			files: ['./rollup.config.js', './src/**'],
			parserOptions: {
				sourceType: 'module'
			},
			rules: {
				'node/no-unsupported-features/es-syntax': ['error', {ignores: ['modules']}]
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
		BROWSER: 'readonly'
	}
};
