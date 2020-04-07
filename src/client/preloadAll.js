/* --------------------
 * react-lazy-ssr module
 * `preloadAll()` method
 * ------------------*/

/* global window */

// Imports
import {CHUNKS_REQUIRED, CHUNKS_READY, FILES_REQUIRED, FILES_READY} from '../shared/constants.js';

// Exports

class PreLoader {
	constructor() {
		// Init deferred promise
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
		this.errored = false;

		// If no chunks to load, resolve promise
		const chunksRequired = window[CHUNKS_REQUIRED] || [];
		const numFilesRemaining = (window[FILES_REQUIRED] || []).length;
		window[CHUNKS_REQUIRED] = undefined;
		window[FILES_REQUIRED] = undefined;

		if (chunksRequired.length === 0) {
			window[CHUNKS_READY] = [];
			window[FILES_READY] = [];
			this.complete();
			return;
		}

		this.chunksRequired = chunksRequired;
		this.numChunksLoading = 0;
		this.numFilesRemaining = numFilesRemaining;

		if (numFilesRemaining > 0) {
			this.awaitFiles();
		} else {
			window[FILES_READY] = [];
			this.preload();
		}
	}

	awaitFiles() {
		// Wait for all script files to load
		const filesReadyInitial = window[FILES_READY];

		const filesReady = [];
		filesReady.push = path => this.fileReady(path);
		window[FILES_READY] = filesReady;

		if (filesReadyInitial) {
			for (const path of filesReadyInitial) {
				this.fileReady(path);
			}
		}
	}

	fileReady() {
		this.numFilesRemaining--;
		if (this.numFilesRemaining === 0) this.preload();
	}

	preload() {
		// Start preloading chunks
		const chunksReadyInitial = window[CHUNKS_READY];

		const chunksReady = [];
		chunksReady.push = chunkProps => this.chunkReady(chunkProps);
		window[CHUNKS_READY] = chunksReady;

		if (chunksReadyInitial) {
			for (const chunkProps of chunksReadyInitial) {
				this.chunkReady(chunkProps);
			}
		}
	}

	chunkReady({chunkName, preload}) {
		if (!this.chunksRequired.includes(chunkName)) return;

		this.numChunksLoading++;

		preload().then(
			() => {
				if (this.errored) return;
				this.numChunksLoading--;
				if (this.numChunksLoading === 0) this.complete();
			},
			(err) => {
				if (this.errored) return;
				this.errored = true;
				this.reject(err);
			}
		);
	}

	complete() {
		// Prevent later components being recorded and filling up memory
		window[CHUNKS_READY].push = noop;
		window[FILES_READY].push = noop;
		this.resolve();
	}
}

export default function preloadAll() {
	const preloader = new PreLoader();
	return preloader.promise;
}

function noop() {}
