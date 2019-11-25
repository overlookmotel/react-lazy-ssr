/* --------------------
 * react-lazy-ssr module
 * Example
 * Server
 * ------------------*/

/* eslint-disable no-console */

'use strict';

// Modules
const pathJoin = require('path').join,
	express = require('express'),
	React = require('react'),
	{renderToStringAsync} = require('react-async-ssr'),
	// eslint-disable-next-line node/no-unpublished-require
	{ChunkExtractor} = require('../../../server'); // require('react-lazy-ssr/server');

// Imports
const App = require('../../build/node/main').default;

// Load stats file
const stats = require('../../build/web/reactLazySsrStats.json');

// Constants
const PORT = 9000;

// Create Express server
const expressApp = express();

expressApp.use('/static', express.static(pathJoin(__dirname, '../../build/web')));

expressApp.get('/', async (req, res) => {
	// Wrap app in a ChunkExtractor
	const chunkExtractor = new ChunkExtractor({stats});
	const app = chunkExtractor.collectChunks(
		// This would be <App /> if using JSX
		React.createElement(App, null)
	);

	// Async render
	const html = await renderToStringAsync(app);
	const scriptsHtml = chunkExtractor.getScriptTags();

	// Return response
	res.send(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>Example</title>
			</head>
			<body>
				<div id="app">${html}</div>
				${scriptsHtml}
			</body>
		</html>
	`);
});

expressApp.use((req, res) => {
	res.status(404);
	res.send('<h1>Not found!</h1>');
});

expressApp.listen(PORT, () => {
	console.log(`Server started at http://localhost:${PORT}/`);
});
