/* --------------------
 * react-lazy-ssr module
 * Jest config
 * ------------------*/

'use strict';

// Exports

const testEnv = (process.env.TEST_ENV || '').toLowerCase(),
	isProd = process.env.NODE_ENV === 'production';

module.exports = {
	testEnvironment: 'node',
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['src/**/*.js'],
	setupFilesAfterEnv: ['jest-extended'],
	// Resolve `import from 'react-lazy-ssr'` to src or build, depending on env variable
	moduleNameMapper: {
		'^react-lazy-ssr$': resolvePath('index'),
		'^react-lazy-ssr/server(\\.js)?$': resolvePath('server'),
		'^react-lazy-ssr/babel(\\.js)?$': resolvePath('babel'),
		'^react-lazy-ssr/webpack(\\.js)?$': resolvePath('webpack'),
		// `react-lazy-ssr-cjs` is not a real module, but the name is injected by Webpack
		// into server-side test fixtures for UMD build.
		// UMD build does not contain server-side code, but server-side code is required
		// for tests, so we use the CJS builds instead on server-side.
		// We also can't use the UMD build of `index.js` on server-side alongside the
		// CJS builds of server code, otherwise they have different React contexts
		// and it doesn't work. So we use CJS build of index on server-side too.
		// So... in the tests of UMD build, the UMD build is actually only tested on client-side.
		// But that's fine - why would you use UMD on Node.js?
		'^react-lazy-ssr-cjs$': resolvePath('index', 'cjs')
	},
	// Define __DEV__ when testing source code
	// (`babel-plugin-dev-expression` does not operate when NODE_ENV=test)
	globals: !testEnv ? {__DEV__: !isProd} : undefined,
	// Transform ESM runtime helpers to CJS
	transformIgnorePatterns: ['<rootDir>/node_modules/(?!@babel/runtime/helpers/esm/)'],
	// Skip server tests for UMD build (which does not include server-side code)
	testPathIgnorePatterns: [
		'/node_modules/',
		...(testEnv === 'umd' ? ['/test/babel.test.js'] : [])
	]
};

function resolvePath(fileName, buildEnv) {
	// Resolve imports in UMD tests to CJS builds (see comment above).
	// Client-side hydration tests for UMD do resolve to UMD build via fake module `react-lazy-ssr-cjs`.
	if (!buildEnv) buildEnv = testEnv === 'umd' && fileName !== 'index' ? 'cjs' : testEnv;

	if (!buildEnv) return `<rootDir>/src/${fileName === 'index' ? 'client' : 'server'}/${fileName}.js`;
	if (buildEnv === 'cjs') return `<rootDir>/${fileName}.js`;
	if (buildEnv === 'esm') return `<rootDir>/es/${fileName}.js`;
	if (buildEnv === 'umd') return `<rootDir>/dist/umd/${fileName}${isProd ? '.min' : ''}.js`;

	throw new Error(
		`Invalid TEST_ENV '${testEnv}' - valid options are 'cjs', 'esm', 'umd' or undefined`
	);
}
