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
		'import/no-unresolved': ['off'],
		'react/jsx-filename-extension': ['off'],
		'node/no-unsupported-features/es-syntax': ['error', {ignores: ['modules']}]
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
