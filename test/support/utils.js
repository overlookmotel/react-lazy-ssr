/* --------------------
 * react-lazy-ssr
 * Tests utilities
 * ------------------*/

// Exports
export function removeSpacing(str) {
	return str.replace(/>\s+/g, '>')
		.replace(/\s+</g, '<')
		.replace(/^\s+|\s+$/g, '');
}

export function removeLineStartSpacing(str) {
	return str.replace(/\n\s+/g, '\n')
		.replace(/^\s+|\s+$/g, '');
}

export function defer() {
	const deferred = {};
	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});
	return deferred;
}
