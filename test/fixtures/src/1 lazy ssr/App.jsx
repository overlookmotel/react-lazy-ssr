/* --------------------
 * react-lazy-ssr module
 * Test fixtures
 * ------------------*/

// Modules
import React, {Suspense} from 'react';
import lazy from 'react-lazy-ssr';

// Lazy-loaded components
const Lazy1 = lazy(() => import('./Lazy1.jsx'));

// Exports

export default function App() {
	return (
		<div>
			<div>Before suspense</div>
			<Suspense fallback={<div>Loading...</div>}>
				<div>Before lazy</div>
				<Lazy1 />
				<div>After lazy</div>
			</Suspense>
			<div>After suspense</div>
		</div>
	);
}
