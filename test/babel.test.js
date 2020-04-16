/* --------------------
 * react-lazy-ssr module
 * Tests for Babel plugin
 * ------------------*/

/* eslint-disable jest/no-standalone-expect */

// Modules
import {create as createPluginTester} from 'babel-test';
import babelPlugin from 'react-lazy-ssr/babel';

// Init
import './support/index.js';

// Create `itTransforms()` test function
const babelTest = createPluginTester({plugins: [babelPlugin]}).test;
function itTransforms(name, fn) {
	return babelTest(name, ({transform}) => {
		async function transformShim(codeIn, options) {
			const {code} = await transform(codeIn, options);
			return code.replace(/\s*\n\s*\s?/g, '');
		}
		return fn(transformShim);
	});
}

// Tests

describe('Babel plugin', () => { // eslint-disable-line jest/lowercase-name
	it('is a function', () => {
		expect(babelPlugin).toBeFunction();
	});

	describe('transforms `lazy()` calls', () => {
		describe('adds `chunkName` option', () => {
			itTransforms('with one call', async (transform) => {
				const res = await transform('const F = lazy(() => import("./Foo.jsx"));');
				expect(res).toBe(
					'const F = lazy(() => import(/* webpackChunkName: "Foo" */"./Foo.jsx"), {chunkName: "Foo"});'
				);
			});

			itTransforms('with two calls, adds different `id` for each', async (transform) => {
				const res = await transform(
					'const F = lazy(() => import("./Foo.jsx"));'
					+ 'const B = lazy(() => import("./Bar.jsx"));'
				);
				expect(res).toBe(
					'const F = lazy(() => import(/* webpackChunkName: "Foo" */"./Foo.jsx"), {chunkName: "Foo"});'
					+ 'const B = lazy(() => import(/* webpackChunkName: "Bar" */"./Bar.jsx"), {chunkName: "Bar"});'
				);
			});
		});

		describe('does not add `chunkName` option when `noSsr` option set', () => {
			itTransforms('with one call', async (transform) => {
				const res = await transform('const F = lazy(() => import("./Foo.jsx"), {noSsr: true});');
				expect(res).toBe(
					'const F = lazy(() => import(/* webpackChunkName: "Foo" */"./Foo.jsx"), {noSsr: true});'
				);
			});

			itTransforms('with two calls', async (transform) => {
				const res = await transform(
					'const F = lazy(() => import("./Foo.jsx"), {noSsr: true});'
					+ 'const B = lazy(() => import("./Bar.jsx"), {noSsr: true});'
				);
				expect(res).toBe(
					'const F = lazy(() => import(/* webpackChunkName: "Foo" */"./Foo.jsx"), {noSsr: true});'
					+ 'const B = lazy(() => import(/* webpackChunkName: "Bar" */"./Bar.jsx"), {noSsr: true});'
				);
			});
		});
	});
});
