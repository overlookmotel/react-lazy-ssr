'use strict';

module.exports = {
	env: {
		browser: true
	},
	parser: 'babel-eslint',
	extends: [
		'@overlookmotel/eslint-config-react'
	],
	parserOptions: {
		sourceType: 'module'
	},
	rules: {
		'import/extensions': ['error', {
			js: 'never',
			jsx: 'always'
		}]
	},
	overrides: [{
		files: ['.babelrc.js', '.eslintrc.js'],
		parserOptions: {
			sourceType: 'script'
		}
	}]
};
