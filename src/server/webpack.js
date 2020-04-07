/* --------------------
 * react-lazy-ssr module
 * Webpack plugin
 * ------------------*/

// Modules
import {mapValues} from 'lodash';

// Exports

export default class ReactLazySsrPlugin {
	constructor(options) {
		this.filename = (options && options.filename) || 'reactLazySsrStats.json';
		this.compiler = null;
	}

	handleEmit(hookCompiler, callback) {
		const stats = hookCompiler.getStats().toJson({
			hash: false,
			modules: false,
			chunks: false,
			assets: false
		});

		const statsShort = {
			publicPath: stats.publicPath,
			chunks: mapValues(stats.namedChunkGroups, chunkStats => chunkStats.assets)
		};

		const result = JSON.stringify(statsShort, null, 2);

		hookCompiler.assets[this.filename] = {
			source() {
				return result;
			},
			size() {
				return result.length;
			}
		};

		callback();
	}

	apply(compiler) {
		this.compiler = compiler;

		compiler.hooks.emit.tapAsync('react-lazy-ssr/webpack', this.handleEmit.bind(this));
	}
}
