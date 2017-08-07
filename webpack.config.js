const path = require('path');
const babelConfigChrome = require('./babel.config').chrome;
const webpack = require('webpack');
const config = require('./config');

module.exports = {
  context: __dirname,
  entry: {
    app: [
      'react-hot-loader/patch',
      './src/client.jsx',
    ],
  },
  devtool: 'source-map',
  output: {
    chunkFilename: '[name].chunk.js',
    filename: '[name].js',
    path: config.clientOutputPath,
    publicPath: `http://localhost:${config.webpack.devServerPort}/${config.webpack.publicPath}`,
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    publicPath: `http://localhost:${config.webpack.devServerPort}/${config.webpack.publicPath}`,
    port: config.webpack.devServerPort,
    hot: true,
    inline: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      }, {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelConfigChrome,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
