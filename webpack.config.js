const path = require('path');
const webpack = require('webpack');
const timestamp = new Date().getTime(); // [ole] for cache busting
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let ip = 'localhost';
if (process.argv[3] && process.argv[3].includes('--ip=') && process.argv[3].length > 5) { // npm run build
	ip = process.argv[3].split('=')[1];
} else if (process.argv[5] && process.argv[5].includes('--ip=') && process.argv[5].length > 5) { // npm run startui
	ip = process.argv[5].split('=')[1];
}

module.exports = {
	entry: {
		client: './src/client.ts',
	},
	output: {
		filename: '[name].bundle.' + timestamp + '.js',
		path: path.resolve(__dirname, 'dist'),
	},
	devServer: {
		port: 9000,
		hot: true,
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: 'src/index.html',
		}),
		new webpack.DefinePlugin({
			LOCAL_IP: JSON.stringify(ip),
		}),
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader'
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
				  'style-loader', // creates `style` nodes from js strings.
				  'css-loader', // translates css into commonjs.
				  'sass-loader', // compiles sass to css.
				],
			  },
		]
	}
}