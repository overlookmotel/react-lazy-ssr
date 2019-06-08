/* --------------------
 * react-lazy-ssr
 * Tests set-up
 * ------------------*/

'use strict';

/*
 * Throw any unhandled promise rejections.
 * For easier debugging of where an unhandled rejection is coming from,
 * if rejected Promise has a `._name` property, it is included in the error message.
 */
process.on('unhandledRejection', (err, promise) => {
	let ctr = promise.constructor.name;
	if (promise._name) ctr += ` ${promise._name}`;
	throw new Error(`Unhandled rejection: ${(err || {}).message} (${ctr})`);
});
