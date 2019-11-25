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
