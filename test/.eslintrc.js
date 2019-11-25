'use strict';

module.exports = {
	extends: [
		'@overlookmotel/eslint-config-jest',
		'@overlookmotel/eslint-config-react'
	],
	rules: {
		'import/extensions': ['error', {
			js: 'never',
			jsx: 'always'
		}],
		'import/no-unresolved': ['off'],
		'react/jsx-filename-extension': ['off']
	},
	overrides: [
		{
			files: [
				'.babelrc.js',
				'.eslintrc.js',
				'fixtures/webpack.config.js',
				'index.test.js',
				'support/**'
			],
			parserOptions: {
				sourceType: 'script'
			}
		}
	]
};
