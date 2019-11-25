/* --------------------
 * react-lazy-ssr module
 * Example
 * Hello component
 * ------------------*/

// Modules
import React from 'react';
import _ from 'lodash';

// Exports
export default function Hello() {
	return (
		<div>{_.join(['Hello', '!'], '')}</div>
	);
}
