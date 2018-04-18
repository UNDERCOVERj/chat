const path = require('path');
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { moduleConfig, resolveConfig, pluginConfig } = require('./webpack.base.config.js')

module.exports = {
	entry: {
		index: [
			// 'webpack-hot-middleware/client?path=/__what&timeout=2000&overlay=false',
			path.resolve(__dirname, '../src/index.js')
		],
		login: [
			// 'webpack-hot-middleware/client?path=/__what&timeout=2000&overlay=false',
			path.resolve(__dirname, '../src/login.js')
		]
	},
	target: 'web',
	node: {
    	fs: "empty",
    	dns: "empty",
    	tls: "empty",
    	module: "empty",
    	net: "empty"
    },
	output: {
		filename: 'js/[name].[hash].js',
		chunkFilename: 'js/[name].[chunkhash].js',
		path: path.resolve(__dirname, '../dist')
	},
	resolve: resolveConfig,
	devtool: 'eval-source-map',// 追踪错误和警告
	module: moduleConfig,
	plugins: [
		// new CleanWebpackPlugin(['dist']),
	    // new webpack.HotModuleReplacementPlugin(),
	    // Use NoErrorsPlugin for webpack 1.x
	    // new webpack.NoEmitOnErrorsPlugin(),
		// new webpack.DllReferencePlugin({
		// 	  manifest: require(path.resolve(__dirname, '../dist/js/manifest.json')),
		// })
	].concat(pluginConfig)
}