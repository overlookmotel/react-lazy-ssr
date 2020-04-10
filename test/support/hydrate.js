/* --------------------
 * react-lazy-ssr module
 * Tests utility functions
 * Client-side hydration
 * ------------------*/

// Modules
import {join as pathJoin} from 'path';
import {format as printf} from 'util';
import {JSDOM, ResourceLoader, VirtualConsole} from 'jsdom';
import {readFile} from 'fs-extra';

// Imports
const {removeLineStartSpacing, defer} = require('./utils.js');

// Exports

module.exports = hydrate;

class ScriptLoader extends ResourceLoader {
	constructor(scriptPath) {
		super();
		this.scriptPath = scriptPath;
		this.loadedFiles = [];
	}

	fetch(url) {
		const filePath = url.slice(26); // Remove 'http://example.org/static/'
		this.loadedFiles.push(filePath);
		return readFile(pathJoin(this.scriptPath, filePath));
	}
}

/**
 * Hydrate React element in browser DOM (JSDOM).
 *
 * @param {Object} options
 * @param {string} options.html - Server-rendered HTML of element
 * @param {string} options.headHtml - HTML to add inside `<head>`
 * @param {string} options.footHtml - HTML to add at end of `<body>`
 * @param {string} options.scriptPath - Path to load script files from
 * @returns {Object}
 */
async function hydrate({html, headHtml, footHtml, scriptPath}) {
	// Init virtual console - save any output to output array
	const virtualConsole = new VirtualConsole();
	const consoleOutput = [];
	for (const method of ['log', 'error', 'warn', 'info', 'debug', 'trace', 'dir', 'dirxml']) {
		virtualConsole.on(
			method, (message, ...args) => {
				consoleOutput.push([method, printf(message, ...args)]);
			}
		);
	}

	// Init script loader
	const scriptLoader = new ScriptLoader(scriptPath);

	// Init hydration promise
	const hydrateDeferred = defer();
	function hydrated() {
		hydrateDeferred.resolve();
	}

	// Init preloaded hook
	let loadedFilesPreload;
	function preloaded() {
		loadedFilesPreload = scriptLoader.loadedFiles;
		scriptLoader.loadedFiles = [];
	}

	// Init DOM with server-rendered HTML
	const clientHtml = removeLineStartSpacing(`
		<html>
			<head>
				${headHtml || ''}
			</head>
			<body>
				<div id="app">${html || ''}</div>
				${footHtml || ''}
			</body>
		</html>
	`);

	const dom = new JSDOM(clientHtml, {
		url: 'http://example.org/',
		runScripts: 'dangerously',
		virtualConsole,
		resources: scriptLoader,
		beforeParse(window) {
			window._preloaded = preloaded;
			window._hydrated = hydrated;
		}
	});

	// Await hydration
	await hydrateDeferred.promise;

	// Check HTML matches server rendered HTML.
	// Strip out invisible elements first.
	// ReactDOM 16.8.6 renders elements inside a suspended `Suspense`, but with `display:none` style.
	// It does rehydrate as it should, but logs errors to console about missing server-rendered content.
	// So to check HTML is what it should be after hydration, need to strip out the elements with
	// `style="display:none"` from client-side HTML.
	// Hydrated client-side HTML also includes some `<!-- -->` blocks in wrong places and
	// sometimes `<div data-reactroot>` rather than `<div data-reactroot="">`.
	// Standardize these too, before comparing HTML.
	const appDiv = dom.window.document.querySelector('#app');

	return {
		hydratedHtml: appDiv.innerHTML,
		consoleOutput,
		loadedFilesPreload,
		loadedFilesLoad: scriptLoader.loadedFiles
	};
}
