/* --------------------
 * react-lazy-ssr module
 * Entry point
 * ------------------*/

/* global window */

// Modules
import {createElement, useContext} from 'react';

// Imports
import preloadAll from './preloadAll.js';
import ServerContext from '../shared/context.js';
import load from '../shared/load.js';
import {isFunction, getNoSsrOption} from '../shared/utils.js';
import {CHUNKS_READY, NOT_LOADED, LOADED, ERRORED} from '../shared/constants.js';

const IS_NODE = typeof window === 'undefined';

// Exports

export default function lazy(loader, options) {
	// Conform inputs
	if (!isFunction(loader)) throw new Error('Loader function must be provided');

	options = {...options};
	const noSsr = getNoSsrOption(options);

	const {chunkName} = options;
	if (IS_NODE && !noSsr && !chunkName) {
		throw new Error('`chunkName` option must be provided on server side');
	}

	// Init state for client
	const clientState = {
		status: NOT_LOADED,
		data: undefined // Contains component, promise or error depending on status
	};

	function LazyComponent(props) {
		// Get state
		let context, state;
		if (IS_NODE) {
			context = useContext(ServerContext);
			if (!context) throw new Error('Must use `ChunkExtractor` on server side');
			state = context.getState(LazyComponent);
		} else {
			state = clientState;
		}

		// If errored, throw error
		const {status} = state;
		if (status === ERRORED) throw state.data;

		// If already loaded, render component
		if (status === LOADED) return createElement(state.data, props);

		// If first time called, load lazy component and record promise
		if (status === NOT_LOADED) {
			if (IS_NODE) {
				// Server side
				context.load(loader, chunkName, noSsr, state);
			} else {
				// Client side
				load(loader, state);
			}
		}

		// Throw promise
		throw state.data;
	}

	// `.preload()` method
	const preload = () => load(loader, clientState);
	LazyComponent.preload = preload;

	// Client-side record this instance is ready for preload
	if (!IS_NODE && !noSsr && chunkName) {
		let chunksReady = window[CHUNKS_READY];
		if (!chunksReady) chunksReady = window[CHUNKS_READY] = [];
		chunksReady.push({chunkName, preload});
	}

	return LazyComponent;
}

lazy.preloadAll = preloadAll;
