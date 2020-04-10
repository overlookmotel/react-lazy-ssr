/* --------------------
 * react-lazy-ssr module
 * CJS+UMD builds entry point
 *
 * This is a hack so that CJS + UMD builds can be imported with:
 * const lazy = require('react-lazy-ssr');
 * const {preloadAll} = lazy;
 *
 * Otherwise, you end up with the main export being an object `{default, preloadAll}`.
 * The `.default` and `__esModule` properties are added in case the CJS build is imported from ESM.
 * ------------------*/

// Imports
import lazy, {preloadAll} from '../index.js';

// Exports

Object.defineProperty(lazy, '__esModule', {value: true});
lazy.preloadAll = preloadAll; // eslint-disable-line import/no-named-as-default-member
lazy.default = lazy;

export default lazy;
