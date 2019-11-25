/* --------------------
 * react-lazy-ssr module
 * Tests
 * ------------------*/

/* eslint-disable global-require */

'use strict';

// Modules
const pathJoin = require('path').join,
	React = require('react'),
	{renderToStringAsync} = require('react-async-ssr'),
	{ChunkExtractor} = require('../server'); // require('react-lazy-ssr/server');

// Imports
const {removeSpacing, removeLineStartSpacing} = require('./support/utils'),
	hydrate = require('./support/hydrate');

// Init
require('./support');

// Tests

describe('1 lazy component', () => {
	describe('with `noSsr: false`', () => {
		const fixturePath = getFixturePath('1 lazy ssr'),
			requireFixture = getRequireFixture(fixturePath);

		let chunkExtractor, html;
		beforeEach(async () => {
			const App = requireFixture('node/main.js').default,
				stats = requireFixture('web/reactLazySsrStats.json');

			chunkExtractor = new ChunkExtractor({stats});

			const app = chunkExtractor.collectChunks(<App />);
			html = await renderToStringAsync(app);
		});

		describe('with `async` and `defer` both false', () => {
			it('renders on server', () => {
				expect(html).toBe(removeSpacing(`
					<div data-reactroot="">
						<div>Before suspense</div>
						<div>Before lazy</div>
						<div>Lazy1</div>
						<div>After lazy</div>
						<div>After suspense</div>
					</div>
				`));
			});

			it('`getScriptFiles()` gets script files for main + lazy', () => {
				const files = chunkExtractor.getScriptFiles();
				expect(files).toEqual([
					'Lazy1.js',
					'vendors~main.js',
					'main.js'
				]);
			});

			it('`getScriptUrls()` gets script URLs for main + lazy', () => {
				const urls = chunkExtractor.getScriptUrls();
				expect(urls).toEqual([
					'/static/Lazy1.js',
					'/static/vendors~main.js',
					'/static/main.js'
				]);
			});

			it('`getRequiredChunks()` gets lazy chunk', () => {
				const urls = chunkExtractor.getRequiredChunks();
				expect(urls).toEqual(['Lazy1']);
			});

			it('`getRequiredChunksScript()` gets lazy chunk', () => {
				const scriptHtml = chunkExtractor.getRequiredChunksScript();
				expect(scriptHtml).toBe('<script>window.__REACT_LAZY_SSR_CHUNKS_REQUIRED__ = ["Lazy1"];</script>');
			});

			it('`getScriptTags()` gets script tags for main + lazy', () => {
				const scriptsHtml = chunkExtractor.getScriptTags();
				expect(scriptsHtml).toBe(removeLineStartSpacing(`
					<script>window.__REACT_LAZY_SSR_CHUNKS_REQUIRED__ = ["Lazy1"];</script>
					<script src="/static/Lazy1.js"></script>
					<script src="/static/vendors~main.js"></script>
					<script src="/static/main.js"></script>
				`));
			});

			it('`getPreloadTags()` gets link tags for main + lazy', () => {
				const linksHtml = chunkExtractor.getPreloadTags();
				expect(linksHtml).toBe(removeLineStartSpacing(`
					<link rel="preload" href="/static/Lazy1.js" as="script">
					<link rel="preload" href="/static/vendors~main.js" as="script">
					<link rel="preload" href="/static/main.js" as="script">
				`));
			});

			it('hyrates on client correctly', async () => {
				const scriptsHtml = chunkExtractor.getScriptTags();

				const {
					hydratedHtml, /* consoleOutput, */ loadedFilesPreload, loadedFilesLoad
				} = await hydrate({
					html,
					footHtml: scriptsHtml,
					scriptPath: pathJoin(fixturePath, 'web')
				});

				expectHtmlMatch(hydratedHtml, html, 'hydration');
				// TODO Fix this!
				// expect(consoleOutput).toEqual([]);
				expect(loadedFilesPreload).toEqual(['Lazy1.js', 'vendors~main.js', 'main.js']);
				expect(loadedFilesLoad).toEqual([]);
			});
		});

		describe('with `async` true', () => {
			it('`getScriptTags()` gets script tags for main + lazy', () => {
				const scriptsHtml = chunkExtractor.getScriptTags({async: true});
				expect(scriptsHtml).toBe(removeLineStartSpacing(`
					<script>window.__REACT_LAZY_SSR_CHUNKS_REQUIRED__ = ["Lazy1"];
					window.__REACT_LAZY_SSR_FILES_REQUIRED__ = ["Lazy1.js","vendors~main.js","main.js"];</script>
					<script src="/static/Lazy1.js" async onLoad="(window.__REACT_LAZY_SSR_FILES_READY__ = window.__REACT_LAZY_SSR_FILES_READY__ || []).push('Lazy1.js')"></script>
					<script src="/static/vendors~main.js" async onLoad="(window.__REACT_LAZY_SSR_FILES_READY__ = window.__REACT_LAZY_SSR_FILES_READY__ || []).push('vendors~main.js')"></script>
					<script src="/static/main.js" async onLoad="(window.__REACT_LAZY_SSR_FILES_READY__ = window.__REACT_LAZY_SSR_FILES_READY__ || []).push('main.js')"></script>
				`));
			});

			it('hyrates on client correctly', async () => {
				const scriptsHtml = chunkExtractor.getScriptTags({async: true});

				const {
					hydratedHtml, /* consoleOutput, */ loadedFilesPreload, loadedFilesLoad
				} = await hydrate({
					html,
					footHtml: scriptsHtml,
					scriptPath: pathJoin(fixturePath, 'web')
				});

				expectHtmlMatch(hydratedHtml, html, 'hydration');
				// TODO Fix this!
				// expect(consoleOutput).toEqual([]);
				expect(loadedFilesPreload).toEqual(['Lazy1.js', 'vendors~main.js', 'main.js']);
				expect(loadedFilesLoad).toEqual([]);
			});

			// TODO Tests for loading in different order
		});
	});

	describe('with `noSsr: true`', () => {
		const fixturePath = getFixturePath('1 lazy no-ssr'),
			requireFixture = getRequireFixture(fixturePath);

		let chunkExtractor, html;
		beforeEach(async () => {
			const App = requireFixture('node/main.js').default,
				stats = requireFixture('web/reactLazySsrStats.json');

			chunkExtractor = new ChunkExtractor({stats});

			const app = chunkExtractor.collectChunks(<App />);
			html = await renderToStringAsync(app);
		});

		it('renders fallback on server', () => {
			expect(html).toBe(removeSpacing(`
				<div data-reactroot="">
					<div>Before suspense</div>
					<div>Loading...</div>
					<div>After suspense</div>
				</div>
			`));
		});

		it('`getScriptFiles()` gets script files for main only', () => {
			const files = chunkExtractor.getScriptFiles();
			expect(files).toEqual([
				'vendors~main.js',
				'main.js'
			]);
		});

		it('`getScriptUrls()` gets script URLs for main only', () => {
			const urls = chunkExtractor.getScriptUrls();
			expect(urls).toEqual([
				'/static/vendors~main.js',
				'/static/main.js'
			]);
		});

		it('`getRequiredChunks()` gets no chunks', () => {
			const urls = chunkExtractor.getRequiredChunks();
			expect(urls).toEqual([]);
		});

		it('`getRequiredChunksScript()` returns empty string', () => {
			const script = chunkExtractor.getRequiredChunksScript();
			expect(script).toBe('');
		});

		it('`getScriptTags()` gets script tags for main only', () => {
			const scripts = chunkExtractor.getScriptTags();
			expect(scripts).toBe(removeLineStartSpacing(`
				<script src="/static/vendors~main.js"></script>
				<script src="/static/main.js"></script>
			`));
		});

		it('`getPreloadTags()` gets link tags for main only', () => {
			const linksHtml = chunkExtractor.getPreloadTags();
			expect(linksHtml).toBe(removeLineStartSpacing(`
				<link rel="preload" href="/static/vendors~main.js" as="script">
				<link rel="preload" href="/static/main.js" as="script">
			`));
		});

		// TODO Test for hydration
	});
});

function getFixturePath(name) {
	return pathJoin(__dirname, 'fixtures', 'build', name);
}

function getRequireFixture(fixturePath) {
	return function(path) {
		path = pathJoin(fixturePath, path);
		return require(path); // eslint-disable-line import/no-dynamic-require
	};
}

/**
 * Expect client-side HTML to match expected.
 * Calls `expect()` and re-writes error message to include what phase the mismatch occurred in.
 * @param {string} html - Client HTML
 * @param {string} expectedHtml - Expected HTML
 * @param {string} phase - Phase where testing (hydration or loaded)
 */
function expectHtmlMatch(html, expectedHtml, phase) {
	try {
		expect(standardizeHtml(html)).toBe(standardizeHtml(expectedHtml));
	} catch (err) {
		const [, message] = err.message.match(/^.+\n\n([\s\S]+)$/) || [];
		if (message) err.message = `Client HTML not as expected after ${phase}.\n\n${message}`;

		throw err;
	}
}

/**
 * Standardize HTML - remove differences between server and client rendered HTML
 * which make no difference to render.
 * Remove:
 *   - `data-reactroot` + `data-reactroot=""` attributes
 *   - `style` + `style=""` attributes
 *   - `<!-- -->` blocks
 *
 * @param {string} html - Input HTML
 * @returns {string} - Standardized HTML
 */
function standardizeHtml(html) {
	return html.replace(/^(<[^ ]+) data-reactroot(?:="")?/, (_, tag) => tag)
		.replace(/(<[^ ]+) style(?:="")?/g, (_, tag) => tag)
		.replace(/<!-- -->/g, '');
}

/**
 * Remove elements from HTML with `style="display:none"`.
 * @param {string} html - HTML
 * @returns {string} - HTML with hidden elements removed
 */
/*
function removeHiddenElements(html) {
	const $ = cheerio.load(`<div id="app">${html}</div>`);
	$('*').each((index, element) => {
		element = $(element);
		if (element.css('display') === 'none') element.remove();
	});
	return $('#app').html();
}
*/
