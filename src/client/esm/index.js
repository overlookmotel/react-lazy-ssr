/* --------------------
 * react-lazy-ssr module
 * ESM build entry point
 *
 * `preloadAll` is exported as a named export with `lazy` as the default export.
 * For backward compatibility `preLoadAll` is also exported as `lazy.preloadAll`,
 * with a deprecation warning.
 * ------------------*/

// Modules
import warning from 'tiny-warning';

// Imports
import lazy, {preloadAll} from '../index.js';

// Exports

export default lazy;
export {preloadAll};

// Also define `lazy.preloadAll` for backward compatibility, with warning in dev build.
// TODO Remove this in a future major version bump.
if (__DEV__) {
	Object.defineProperty(lazy, 'preloadAll', {
		get() {
			warning(
				false,
				'Accessing `preloadAll` as `lazy.proloadAll` is deprecated.\n'
				+ "Import with `import {preloadAll} from 'react-lazy-ssr'` instead."
			);
			return preloadAll;
		}
	});
} else {
	lazy.preloadAll = preloadAll; // eslint-disable-line import/no-named-as-default-member
}
