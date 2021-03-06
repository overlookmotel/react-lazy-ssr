/* --------------------
 * react-lazy-ssr module
 * Build test files ready for webpack
 * ------------------*/

'use strict';

// Modules
const pathJoin = require('path').join,
	fs = require('fs-extra');

// Build

// Empty temp folder
const fixturesPath = pathJoin(__dirname, '..', 'fixtures'),
	srcPath = pathJoin(fixturesPath, 'src'),
	tempPath = pathJoin(fixturesPath, 'temp');

fs.removeSync(tempPath);
fs.mkdirSync(tempPath);

// Copy fixtures to temp folder, adding `client.jsx` to each
const fixtureNames = fs.readdirSync(srcPath)
	.filter(filename => fs.statSync(pathJoin(srcPath, filename)).isDirectory());

const clientPath = pathJoin(srcPath, 'client.jsx');

for (const fixtureName of fixtureNames) {
	const fixturePath = pathJoin(tempPath, fixtureName);
	fs.copySync(pathJoin(srcPath, fixtureName), fixturePath);
	fs.copySync(clientPath, pathJoin(fixturePath, 'client.jsx'));
}
