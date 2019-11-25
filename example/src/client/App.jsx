/* --------------------
 * react-lazy-ssr module
 * Example
 * App
 * ------------------*/

// Modules
import React, {Suspense} from 'react';
import lazy from 'react-lazy-ssr';

// Define lazy-loaded component
const Hello = lazy(() => import('./Hello.jsx'));

// Exports
export default function App() {
	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<div>Before</div>
				<Hello />
				<div>After</div>
			</Suspense>
		</div>
	);
}
