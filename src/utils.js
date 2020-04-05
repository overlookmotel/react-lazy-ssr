/* --------------------
 * react-lazy-ssr module
 * Utils
 * ------------------*/

// Exports
export function isFunction(arg) {
	return typeof arg === 'function';
}

export function getNoSsrOption(options) {
	const {ssr} = options;
	if (ssr != null) return !ssr;

	const {noSsr} = options;
	if (noSsr != null) return !!noSsr;

	return false;
}

const hasOwnProp = Object.prototype.hasOwnProperty;
export function hasOwnProperty(obj, prop) {
	return hasOwnProp.call(obj, prop);
}
