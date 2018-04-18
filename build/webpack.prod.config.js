const path = require('path');
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const { moduleConfig, resolveConfig, pluginConfig } = require('./webpack.base.config.js')

module.exports = {
	entry: {
		index: './src/index.js',
		login: './src/login.js',
		vendor: ['react', 'react-dom']
	},
	output: {
		filename: 'js/[name].[chunkhash].js',
		chunkFilename: 'js/[name].[chunkhash].js',
		path: path.resolve(__dirname, '../dist')
	},
	resolve: resolveConfig,
	module: moduleConfig,
	plugins: [
		new CleanWebpackPlugin(path.resolve(__dirname, '../dist'), {
		    root: path.resolve(__dirname, '../'),    // 设置root
		}),
		new webpack.HashedModuleIdsPlugin(),
		new webpack.optimize.CommonsChunkPlugin({ 
            name: 'vendor',
			minChunks: function (module) {
				// any required modules inside node_modules are extracted to vendor
				return (
					module.resource &&
						/\.js$/.test(module.resource) &&
							module.resource.indexOf(
								path.join(__dirname, '../node_modules')
							) === 0
				)
			}             
        }),
        new webpack.optimize.CommonsChunkPlugin({
	        name: 'manifest'
	    }),
		new OptimizeCSSPlugin({
			cssProcessorOptions: { 
				safe: true, 
				map: { 
					inline: false 
				} 
			}
		})	      
	].concat(pluginConfig)
}