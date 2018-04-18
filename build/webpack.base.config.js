const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');


const moduleConfig = {
	rules: [
		{ 
			test: /\.js$/, 
			use: 'babel-loader', 
			exclude: /node_modules/,
			include: path.join(__dirname, '../src'),
		},
		{
			test: /(\.css$)|(\.scss)/,
			use: ExtractTextPlugin.extract({  
                fallback: 'style-loader',  
                use: [  
                    {
						loader: 'css-loader',
						options: {
							camelCase: true,
						    // modules: true,
						    localIdentName: '[name]_[local]--[hash:base64:5]'
						}
					},  
                    'sass-loader',
					'postcss-loader'  
                ]  
            })
		},
		{
	        test: /\.json$/,
	        loader: 'json-loader'
	    }
	]
}

const resolveConfig = {
	alias: {
		'@': path.join(__dirname, '../src')
	},
	extensions: ['*', '.js', '.jsx'],
}

const pluginConfig = [
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, '../src/index.html'),
		filename: 'index.html',
		inject: true,
		chunks: ['index', 'vendor'],
		hash: true,
		minify: {
			removeComments: true,
			collapseWhitespace: true,
			removeAttributeQuotes: true
		}		
	}),
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, '../src/login.html'),
		filename: 'login.html',
		inject: true,
		chunks: ['login', 'vendor'],
		hash: true,
		minify: {
			removeComments: true,
			collapseWhitespace: true,
			removeAttributeQuotes: true
		}
	}),
	new ParallelUglifyPlugin({
		cacheDir: '.cache/',
		uglifyJS:{
			output: {
				comments: false
			},
			compress: {
				warnings: false
			}
		}
	}),
	new ExtractTextPlugin({
		filename: 'css/[name].[contenthash].css',
		allChunks: false,
	})
]
module.exports = {
	moduleConfig,
	resolveConfig,
	pluginConfig
}