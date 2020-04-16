/* --------------------
 * react-lazy-ssr module
 * Test fixtures
 * ------------------*/

// Modules
import React from 'react';
import ReactDOM from 'react-dom';
import {preloadAll} from 'react-lazy-ssr';

// Import app
// eslint-disable-next-line node/no-missing-import, import/no-unresolved
import App from './App.jsx';

// Hydrate app
preloadAll().then(() => {
	if (window._preloaded) window._preloaded();

	const root = document.getElementById('app');
	ReactDOM.hydrate(<App />, root, () => {
		if (window._hydrated) window._hydrated();
	});
});
