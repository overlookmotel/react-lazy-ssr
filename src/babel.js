/* --------------------
 * react-lazy-ssr module
 * Babel plugin
 * ------------------*/

// Modules
import {join as pathJoin, relative as pathRelative, extname as pathExtname} from 'path';
import {isString, isArray} from 'is-it-type';
import vm from 'vm';
import syntaxDynamicImport from '@babel/plugin-syntax-dynamic-import';

// Imports
import {getNoSsrOption} from './utils.js';

// Exports

export default function babelPlugin(api, options) {
	const {types} = api;

	// Conform options
	const {rootPath} = options;
	if (rootPath != null && !isString(rootPath)) {
		throw new Error(`\`rootPath\` option must be a string if provided, but received ${rootPath}`);
	}

	let {exts} = options;
	if (exts == null) {
		// Default
		exts = ['js', 'jsx', 'mjs', 'cjs'];
	} else if (isString(exts)) {
		exts = [exts];
	} else if (!isArray(exts) || !exts.every(isString)) {
		throw new Error(`\`exts\` option must be a string or array of strings if provided, but received ${exts}`);
	}

	// Return plugin
	return {
		inherits: syntaxDynamicImport,
		visitor: {
			CallExpression: (path, state) => transformImport(path, state, rootPath, exts, types)
		}
	};
}

function transformImport(lazyPath, state, rootPath, exts, t) {
	// Check function is called 'lazy'
	if (!lazyPath.get('callee').isIdentifier({name: 'lazy'})) return;

	// Get loader function
	const fnPath = lazyPath.get('arguments.0');
	if (!fnPath || (!fnPath.isFunctionExpression() && !fnPath.isArrowFunctionExpression())) {
		throw new Error('`lazy()` 1st argument must be a loader function');
	}

	// Find `import()` statement in loader function
	const importPaths = [];
	fnPath.traverse({
		Import(path) {
			if (isWithin(path, fnPath)) importPaths.push(path);
		}
	});

	if (importPaths.length !== 1) {
		throw new Error('`lazy()` loader function must contain one `import()` statement');
	}

	// Check `import()` called with string literal
	const importPath = importPaths[0].parentPath;
	if (importPath.node.arguments.length !== 1) {
		throw new Error('`import()` must be called with one argument only');
	}

	const urlPath = importPath.get('arguments.0');
	if (!urlPath.isStringLiteral()) throw new Error('`import()` path must be a string literal');

	// Read or create options object
	const options = {};
	let optionsPath;
	if (lazyPath.node.arguments.length > 1) {
		optionsPath = lazyPath.get('arguments.1');
		if (!optionsPath.isObjectExpression()) {
			throw new Error('`lazy()` options must be an object literal');
		}

		for (let i = 0; i < optionsPath.node.properties.length; i++) {
			const propPath = optionsPath.get(`properties.${i}`);

			const keyPath = propPath.get('key');
			if (!keyPath.isIdentifier()) {
				throw new Error('`lazy()` options object must contain only identified keys');
			}
			const key = keyPath.node.name;

			const valuePath = propPath.get('value');
			if (key === 'chunkName') {
				if (!valuePath.isStringLiteral()) {
					throw new Error('`chunkName` option must be a string literal if defined');
				}
				options.chunkName = valuePath.node.value;
			} else if (key === 'ssr' || key === 'noSsr') {
				if (!valuePath.isBooleanLiteral()) {
					throw new Error(`\`${key}\` option must be a boolean literal if defined`);
				}
				options[key] = valuePath.node.value;
			}
		}
	} else {
		// Create options object
		const optionsNode = t.objectExpression([]);
		lazyPath.pushContainer('arguments', optionsNode);
		optionsPath = lazyPath.get('arguments.1');
	}

	// Get chunk name from `webpackChunkName: "..."` comment
	let chunkName;
	let comments = urlPath.node.leadingComments;
	if (comments) {
		for (const comment of comments) {
			if (comment.type !== 'CommentBlock') continue;

			const commentValue = comment.value;
			if (!/^\s*webpack[A-Z][A-Za-z]+:/.test(commentValue)) continue;

			let webpackOptions;
			try {
				webpackOptions = vm.runInNewContext(`(function(){return {${commentValue}};})()`);
			} catch (err) {
				throw new Error(`Could not parse webpack options comment /*${commentValue}*/`);
			}

			const {webpackChunkName} = webpackOptions;
			if (webpackChunkName) chunkName = webpackChunkName;
		}
	}

	// If no chunk name comment, insert comment
	if (chunkName) {
		if (options.chunkName && options.chunkName !== chunkName) {
			throw new Error(`Chunk name defined in \`webpackChunkName\` comment and \`lazy()\` options do not match - '${chunkName}' vs '${options.chunkName}'`);
		}
	} else {
		// Use chunk name from options
		chunkName = options.chunkName;

		// If no chunkName option, get chunk name from import path
		if (!chunkName) chunkName = importPathToChunkName(urlPath.node.value, rootPath, exts, state);

		// Create `webpackChunkName: "..."` comment
		if (!comments) comments = urlPath.node.leadingComments = [];
		comments.push({
			type: 'CommentBlock',
			value: ` webpackChunkName: ${JSON.stringify(chunkName)} `
		});
	}

	// If chunk name option provided, or no-SSR, exit - no need to add `chunkName` option
	const noSsr = getNoSsrOption(options);
	if (options.chunkName || noSsr) return;

	// Add `chunkName` property to options object
	const propPath = t.objectProperty(t.identifier('chunkName'), t.stringLiteral(chunkName));
	optionsPath.pushContainer('properties', propPath);
}

function isWithin(path, ancestorPath) {
	while (true) { // eslint-disable-line no-constant-condition
		path = path.parentPath;
		if (!path) return false;
		if (path === ancestorPath) return true;
	}
}

// Convert `import()` path to chunk name
// Code for normalizing path copied from `@loadable/babel-plugin`
// (`src/properties/chunkName.js` `moduleToChunk()`)
const PATH_REGEXP = /^[./]+/,
	WEBPACK_PATH_NAME_NORMALIZE_REPLACE_REGEX = /[^a-zA-Z0-9_!§$()=\-^°]+/g,
	WEBPACK_MATCH_PADDED_HYPHENS_REPLACE_REGEX = /^-|-$/g;

function importPathToChunkName(path, rootPath, exts, state) {
	// If `rootPath` option provided, resolve path relative to root
	if (rootPath != null) {
		path = pathJoin(state.file.opts.filename, '..', path);
		path = pathRelative(rootPath, path);
	}

	// Strip file extensions off path, according to `exts` option
	const ext = pathExtname(path);
	if (ext === '.') {
		path = path.slice(0, -1);
	} else if (exts.includes(ext.slice(1))) {
		path = path.slice(0, -ext.length);
	}

	// Convert path to chunk name
	return path.replace(PATH_REGEXP, '')
		.replace(WEBPACK_PATH_NAME_NORMALIZE_REPLACE_REGEX, '-')
		.replace(WEBPACK_MATCH_PADDED_HYPHENS_REPLACE_REGEX, '');
}
