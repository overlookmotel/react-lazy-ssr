[![NPM version](https://img.shields.io/npm/v/react-lazy-ssr.svg)](https://www.npmjs.com/package/react-lazy-ssr)
[![Build Status](https://img.shields.io/travis/overlookmotel/react-lazy-ssr/master.svg)](http://travis-ci.org/overlookmotel/react-lazy-ssr)
[![Dependency Status](https://img.shields.io/david/overlookmotel/react-lazy-ssr.svg)](https://david-dm.org/overlookmotel/react-lazy-ssr)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookmotel/react-lazy-ssr.svg)](https://david-dm.org/overlookmotel/react-lazy-ssr)
[![Greenkeeper badge](https://badges.greenkeeper.io/overlookmotel/react-lazy-ssr.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/overlookmotel/react-lazy-ssr/master.svg)](https://coveralls.io/r/overlookmotel/react-lazy-ssr)

# React.lazy substitute which works with server-side rendering

## Usage

`react-lazy-ssr` is a drop-in substitute for [`React.lazy`](https://reactjs.org/docs/code-splitting.html#reactlazy).

Unlike React's built-in `.lazy()` method, it can be used in server-side rendering with [react-async-ssr](https://www.npmjs.com/package/react-async-ssr).

### Client-side only

Use `react-lazy-ssr` exactly as you would `React.lazy`:

```js
import React, {Suspense} from 'react';
import lazy from 'react-lazy-ssr';

const LazyFoo = lazy(
  () => import('./Foo.jsx')
);

const App = () => (
  <Suspense fallback="Loading...">
    <LazyFoo />
  </Suspense>
);
```

### Server-side rendering

There are 5 steps to making server-side rendering work.

There is an example of a complete repo [here](https://github.com/overlookmotel/react-lazy-ssr/tree/master/example). It's less complicated than it sounds!

#### 1. Server-side renderer

Use [react-async-ssr](https://www.npmjs.com/package/react-async-ssr)'s `.renderToStringAsync()` method to render on server, rather than react-dom's `.renderToString()` (see [here](https://www.npmjs.com/package/react-async-ssr) for instructions).

#### 2. Name all lazy components

Each lazy component must have a unique name, which can be provided with the `chunkName` option.

```js
const LazyFoo = lazy(
  () => import('./Foo.jsx'),
  { chunkName: 'Foo' }
);
```

NB Name must be unique for the resource being loaded, NOT unique for each call to `lazy()`. If different files both want to lazy load the same component, they can (and should) use the same name.

##### Babel plugin

This package provides a Babel plugin to add chunk names automatically for you.

Add `react-lazy-ssr/babel` plugin to your Babel config:

```js
// .babelrc.js
const LazyPlugin = require('react-lazy-ssr/babel');

module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react'
  ],
  plugins: [
	[ LazyPlugin, { rootPath: __dirname} ]
  ]
};
```

`rootPath` option is optional, but it ensures no naming clashes where `import()` is given relative paths.

The Babel plugin will transform this:

```js
lazy( () => import( './Foo.jsx' ) );
```

to this:

```js
lazy(
  () => import( /* webpackChunkName: "Foo" */ './Foo.jsx' ),
  { chunkName: 'Foo' }
);
```

#### 3. Webpack plugin

Add this package's Webpack plugin to your Webpack config (for the client-side build only):

```js
// webpack.config.js
const ReactLazySsrPlugin = require('react-lazy-ssr/webpack');

module.exports = {
  target: 'web',
  entry: `./src/client/main.jsx`,
  plugins: [
	new ReactLazySsrPlugin()
  ],
  ...
}
```

The purpose of the Webpack plugin is to output a JSON stats file which maps module names to the filenames of files Webpack outputs. This stats file is used by the next step.

After running Webpack, you'll find a file `reactLazySsrStats.json` in the build folder.

#### 4. Server-side: Capture chunks

In order for the page to hydrate correctly on the client side, all the code which is lazy-loaded on the server must also be sent to the client to load prior to hydration.

This package provides `ChunkExtractor` to do this.

* Wrap the app before rendering in a `ChunkExtractor`.
* Call `chunkExtractor.getScriptTags()` to get all the `<script>` tags to add at the bottom of the HTML body.

```js
// Import packages
const {renderToStringAsync} = require('react-async-ssr'),
  {ChunkExtractor} = require('react-lazy-ssr/server');

// Import App - Webpack's entry chunk
const App = require('./build/server/main.js');

// Load stats file
const stats = require('./build/client/reactLazySsrStats.json');

// Define route
expressApp.get( '/', async (req, res) => {
  // Wrap app in a ChunkExtractor
  const chunkExtractor = new ChunkExtractor( { stats } );
  const app = chunkExtractor.collectChunks( <App /> );

  // Async render
  const html = await renderToStringAsync( app );

  // Get scripts
  const scriptsHtml = chunkExtractor.getScriptTags();

  // Return response
  res.send(`
    <html>
      <head><title>Example</title></head>
      <body>
        <div id="app">${ html }</div>
        ${ scriptsHtml }
      </body>
    </html>
  `);
} );
```

#### 5. Client-side: Preload all lazy components before hydrating

On the client side, all lazy components must be preloaded before hydrating the app. This ensures the app is "primed" and renders exactly the same on client as it did on the server.

Instead of:

```js
ReactDOM.hydrate(
  <App />,
  document.getElementById('app')
);
```

use:

```js
import lazy from 'react-lazy-ssr';

lazy.preloadAll().then( () => {
  ReactDOM.hydrate(
	<App />,
	document.getElementById('app')
  );
} );
```

## Advanced usage

### Excluding components from rendering on server

Sometimes you might want to prevent a component rendering on server side. For example, it might be a low-priority part of the page, "below the fold", or a heavy component which will take a long time to load and increase the delay before hydration.

To prevent a component rendering on server-side, use the `noSsr` option.

```js
const LazyFoo = lazy(
  () => import('./Foo.jsx'),
  { noSsr: true }
);
```

The no-SSR component will trigger the nearest `Suspense` fallback on the server side, and it's that fallback HTML which will be sent to the client. Then the component will be loaded on the client-side *after* hydration.

### Preloading a lazy component

To preload a lazy component before it's rendered, call `.preload()`.

`.preload()` returns a promise which resolves when the component is loaded, or rejects if loading fails.

```js
const LazyFoo = lazy( () => import('./Foo.jsx') );

LazyFoo.preload().then(
  () => console.log('Loaded'),
  (err) => console.log('Error:', err)
);
```

### Entry points

By default, `ChunkExtractor` expects the app entry point chunk to be called `main`. You can change this with the `entryPoint` option.

```js
const chunkExtractor = new ChunkExtractor( {
  stats,
  entryPoint: 'entry'
} );
```

Or, if the app has multiple entry points, provide an array:

```js
const chunkExtractor = new ChunkExtractor( {
  stats,
  entryPoint: [ 'entry1', 'entry2' ]
} );
```

### Optimizing client-side loading

#### `async` and `defer`

By default, `chunkExtractor.getScriptTags()` will produce `<script>` tags suitable for putting at the bottom of the HTML body.

It produces something like:

```html
<script>
window.__REACT_LAZY_SSR_CHUNKS_REQUIRED__ = ["LazyLoaded"];
</script>
<script src="/static/LazyLoaded.js"></script>
<script src="/static/vendors~main.js"></script>
<script src="/static/main.js"></script>
```

You may be able to improve loading performance by putting the scripts in the HTML head and using `async` or `defer` attributes.

Pass either `{async: true}` or `{defer: true}` to `.getScriptTags()`:

```js
chunkExtractor.getScriptTags( { async: true } )
```

This adds an `async` attribute to the `<script>` elements and adds some Javascript to ensure the page is not hydrated until all have loaded.

```html
<script>
window.__REACT_LAZY_SSR_CHUNKS_REQUIRED__ = ["LazyLoaded"];
window.__REACT_LAZY_SSR_FILES_REQUIRED__ =
  ["LazyLoaded.js","vendors~main.js","main.js"];
</script>
<script async src="/static/LazyLoaded.js" onload="..."></script>
<script async src="/static/vendors~main.js" onload="..."></script>
<script async src="/static/main.js" onload="..."></script>
```

#### Preload tags

You can also use `<link rel="preload">` tags at the top of the page to preload Javascript while the browser is still parsing the HTML body.

Use `.getPreloadTags()` and put the returned HTML in the document head, in addition to script tags at bottom of the HTML body.

`.getPreloadTags()` returns:

```html
<link rel="preload" href="/static/LazyLoaded.js" as="script">
<link rel="preload" href="/static/vendors~main.js" as="script">
<link rel="preload" href="/static/main.js" as="script">
```

### Babel plugin: File extensions

Certain file extensions will be stripped off when creating chunk names e.g. `Foo.jsx` => `Foo`.

By default, the file extensions which are stripped are `.js`, `.jsx`, `.mjs` and `.cjs`.

You can customize this with the `exts` option.

```js
// .babelrc.js
const LazyPlugin = require('react-lazy-ssr/babel');

module.exports = {
  ...
  plugins: [
	[
      LazyPlugin,
	  {
		rootPath: __dirname,
		exts: ['js', 'jsx', 'react']
	  }
	]
  ]
};
```

### Webpack plugin: Stats file name

If you want the stats file to be called something other than `reactLazySsrStats.json`, you can use the `filename` option.

```js
// webpack.config.js
module.exports = {
  plugins: [
	new ReactLazySsrPlugin( {
      filename: 'my-alternative-filename.json'
	} )
  ],
  ...
}
```

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookmotel/react-lazy-ssr/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookmotel/react-lazy-ssr/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add tests for new features
* document new functionality/API additions in README
* do not add an entry to Changelog (Changelog is created when cutting releases)
