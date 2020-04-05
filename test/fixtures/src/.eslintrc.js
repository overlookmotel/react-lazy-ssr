module.exports = {
	env: {
		browser: true
	},
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module'
	},
	rules: {
		'node/no-unsupported-features/es-syntax': ['error', {ignores: ['modules', 'dynamicImport']}],
		'node/no-missing-import': 'off'
	}
};
