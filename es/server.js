/* --------------------
 * react-lazy-ssr module
 * ESM server entry point
 * Re-export in tree-shakable form, choosing dev or prod build based on NODE_ENV.
 * ------------------*/

// Imports
import {
	ChunkExtractor as ChunkExtractorProd,
	ChunkExtractorManager as ChunkExtractorManagerProd
} from '../dist/esm/server.min.js';

import {
	ChunkExtractor as ChunkExtractorDev,
	ChunkExtractorManager as ChunkExtractorManagerDev
} from '../dist/esm/server.js';

// Exports

export const ChunkExtractor = process.env.NODE_ENV === 'production'
	? ChunkExtractorProd
	: ChunkExtractorDev;
export const ChunkExtractorManager = process.env.NODE_ENV === 'production'
	? ChunkExtractorManagerProd
	: ChunkExtractorManagerDev;
