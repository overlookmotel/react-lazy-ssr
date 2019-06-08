/* --------------------
 * react-lazy-ssr module
 * Tests
 * ------------------*/

'use strict';

// Modules
const lazy = require('../index');

// Init
require('./support');

// Tests

describe('tests', () => {
	it.skip('all', () => { // eslint-disable-line jest/no-disabled-tests
		expect(lazy).not.toBeUndefined();
	});
});
