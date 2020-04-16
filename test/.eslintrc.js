/* --------------------
 * react-lazy-ssr module
 * Tests ESLint config
 * ------------------*/

'use strict';

// Exports

module.exports = {
	extends: [
		'@overlookmotel/eslint-config-jest',
		'@overlookmotel/eslint-config-react'
	],
	rules: {
		'react/jsx-filename-extension': ['off'],
		'node/no-unsupported-features/es-syntax': ['error', {ignores: ['modules']}],
		'import/no-unresolved': ['error', {ignore: ['^react-lazy-ssr($|/)']}],
		'node/no-missing-import': ['error', {allowModules: ['react-lazy-ssr']}]
	},
	overrides: [
		{
			files: [
				'.babelrc.js',
				'.eslintrc.js',
				'support/build.js',
				'fixtures/webpack.config.js'
			],
			parserOptions: {
				sourceType: 'script'
			}
		}
	]
};
