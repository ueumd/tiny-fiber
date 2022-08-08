const HtmlWebpackPlugin = require('html-webpack-plugin')

/** @type {import('webpack').Configuration} */
module.exports = {
	mode: 'development',
	devtool: 'source-map',
	devServer: {
		hot: true,
		port: 3000
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html'
		})
	]
}
