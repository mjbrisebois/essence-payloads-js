const webpack			= require('webpack');


module.exports = {
    target: 'web',
    mode: 'production', // production | development
    entry: [ './src/index.js' ],
    output: {
	filename: 'essence.bundled.js',
	globalObject: 'this',
	library: {
	    "name": "Essence",
	    "type": "umd",
	},
    },
    stats: {
	colors: true
    },
    devtool: 'source-map',
};
