const path = require('path');
const webpack = require('webpack')
const { moduleConfig, pluginConfig } = require('./webpack.base.config.js')

module.exports = {
	entry: {
		lib: ['react', 'react-dom']
	},
	output: {
		filename: 'js/[name].js',
		path: path.resolve(__dirname, '../dist'),
		library: '[name]'
	},
	devtool: 'eval-source-map',// 追踪错误和警告
	module: moduleConfig,
	plugins: [
		new webpack.DllPlugin({
			path: path.join(__dirname, '../dist/js/manifest.json'),
			name: '[name]',
			context: __dirname
		}),
		
	].concat(pluginConfig)
}