'use strict';

module.exports = {
	extends: [
		'@overlookmotel/eslint-config'
	],
	overrides: [{
		files: ['src/server/index.js'],
		rules: {
			'import/no-unresolved': ['off'],
			'node/no-missing-require': ['off']
		}
	}]
};
