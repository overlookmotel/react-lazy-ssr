'use strict';

module.exports = {
	extends: [
		'@overlookmotel/eslint-config'
	],
	rules: {
		'no-multi-assign': ['off']
	},
	overrides: [
		{
			files: ['./rollup.config.js', './src/**'],
			parserOptions: {
				sourceType: 'module'
			},
			rules: {
				'node/no-unsupported-features/es-syntax': ['error', {ignores: ['modules']}]
			}
		},
		{
			files: ['./index.js', './server.js', './babel.js', './webpack.js'],
			rules: {
				'import/no-unresolved': ['off'],
				'node/no-missing-require': ['off']
			}
		}
	],
	globals: {
		BROWSER: 'readonly'
	}
};
