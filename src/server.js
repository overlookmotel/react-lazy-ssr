/* --------------------
 * react-lazy-ssr module
 * `react-lazy-ssr/server` entry point
 * ------------------*/

// Modules
import React from 'react';
import {NO_SSR, ON_MOUNT} from 'react-async-ssr/symbols';
import {isString, isArray} from 'is-it-type';

// Imports
import ServerContext from './context';
import load from './load';
import {CHUNKS_REQUIRED, FILES_REQUIRED, FILES_READY, NOT_LOADED, LOADING} from './constants';

// Exports

export class ChunkExtractor {
	constructor(options) {
		// Conform options
		if (!options) throw new Error('ChunkExtractor must be called with options object');

		const {stats} = options;
		if (!stats) throw new Error('ChunkExtractor must be provided stats object');
		this._publicPath = stats.publicPath;
		this._chunkFiles = stats.chunks;

		let entryPoints = options.entryPoint;
		if (entryPoints == null) {
			// Default
			entryPoints = ['main'];
		} else if (isString(entryPoints)) {
			entryPoints = [entryPoints];
		} else if (!isArray(entryPoints) || !entryPoints.every(isString)) {
			throw new Error('ChunkExtractor `entryPoint` option must be a string or array of strings if provided');
		}
		this._entryPoints = entryPoints;

		// Init chunk names set
		this._chunkNames = new Set();
	}

	collectChunks(children) {
		return ChunkExtractorManager(this, children);
	}

	getScriptTags(options) {
		options = {...options};

		// Create scripts for files
		const modifiers = `${options.async ? ' async' : ''}${options.defer ? ' defer' : ''}`;

		const paths = this.getScriptFiles();

		const publicPath = this._publicPath;
		const scripts = paths.map((path) => {
			const scriptModifiers = modifiers === '' ? ''
				: `${modifiers} onLoad="(window.${FILES_READY} = window.${FILES_READY} || []).push(${stringifyString(path)})"`;
			return `<script src="${publicPath}${path}"${scriptModifiers}></script>`;
		});

		// Create script for list of lazy chunks to await
		const chunkNames = this._chunkNames;
		if (chunkNames.size > 0) {
			let varsJs = `window.${CHUNKS_REQUIRED} = ${JSON.stringify(Array.from(chunkNames))};`;
			if (modifiers !== '') {
				varsJs += `\nwindow.${FILES_REQUIRED} = ${JSON.stringify(Array.from(paths))};`;
			}
			scripts.unshift(`<script>${varsJs}</script>`);
		}

		return scripts.join('\n');
	}

	getPreloadTags() {
		const paths = this.getScriptFiles(),
			publicPath = this._publicPath;
		return paths.map(path => `<link rel="preload" href="${publicPath}${path}" as="script">`)
			.join('\n');
	}

	getScriptUrls() {
		// Create scripts for files
		const publicPath = this._publicPath;
		return this.getScriptFiles().map(path => `${publicPath}${path}`);
	}

	getScriptFiles() {
		const chunkFiles = this._chunkFiles;

		// Get files for chunks
		const files = new Set();
		for (const chunkName of this._chunkNames) {
			for (const path of chunkFiles[chunkName]) {
				files.add(path);
			}
		}

		// Get files for entry points
		for (const chunkName of this._entryPoints) {
			for (const path of chunkFiles[chunkName]) {
				// Ensure paths for entry points are last
				files.delete(path);
				files.add(path);
			}
		}

		return Array.from(files);
	}

	getRequiredChunksScript() {
		const chunkNames = this._chunkNames;
		if (chunkNames.size === 0) return '';
		return `<script>window.${CHUNKS_REQUIRED} = ${JSON.stringify(Array.from(chunkNames))};</script>`;
	}

	getRequiredChunks() {
		return Array.from(this._chunkNames);
	}

	_mounted(chunkName, willDisplay) {
		// Ignore chunks which won't be displayed
		if (willDisplay) this._chunkNames.add(chunkName);
	}
}

class Ctx {
	constructor(extractor) {
		this.extractor = extractor;
		this.loadStates = new Map();
	}

	getState(LazyComponent) {
		const {loadStates} = this;
		let state = loadStates.get(LazyComponent);
		if (!state) {
			state = {
				status: NOT_LOADED,
				data: undefined
			};
			loadStates.set(LazyComponent, state);
		}
		return state;
	}

	load(loader, chunkName, noSsr, state) {
		let promise;
		if (noSsr) {
			// No SSR required - make promise marked NO_SSR
			state.status = LOADING;
			promise = new Promise(() => {});
			promise[NO_SSR] = true;
			state.data = promise;
		} else {
			// SSR - load
			promise = load(loader, state);
		}

		// Register handler to record chunks when mounted
		promise[ON_MOUNT] = willDisplay => this.extractor._mounted(chunkName, willDisplay);
	}
}

export function ChunkExtractorManager(extractor, children) {
	return React.createElement(
		ServerContext.Provider,
		{
			value: new Ctx(extractor)
		},
		children
	);
}

function stringifyString(str) {
	return `'${str.replace(/"/g, '&quot;').replace(/'/g, "\\'")}'`;
}
