/* --------------------
 * react-lazy-ssr module
 * `load()` function
 * ------------------*/

// Modules
import hasOwnProperty from 'has-own-prop';

// Imports
import {LOADING, LOADED, ERRORED} from './constants';

// Exports
export default function load(loader, state) {
	// Load async
	state.status = LOADING;

	const promise = new Promise(
		// Wrap `loader()` in promise to handle thenables and sync errors
		resolve => resolve(loader())
	).then((module) => {
		// Loaded
		const component = getExport(module);
		state.status = LOADED;
		state.data = component;
	}).catch((err) => {
		// Error
		state.status = ERRORED;
		state.data = err;
		throw err;
	});

	state.data = promise;
	return promise;
}

function getExport(o) {
	return o && hasOwnProperty(o, 'default') ? o.default : o;
}
