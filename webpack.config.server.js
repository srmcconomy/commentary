const path = require('path');
const babelConfigNode = require('./babel.config').node;
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname,
  entry: {
    app: [
      './src/server.jsx',
    ],
  },
  externals: [nodeExternals()],
  target: 'node',
  devtool: 'source-map',
  output: {
    chunkFilename: '[name].chunk.js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `require('source-map-support').install();`,
      raw: true,
      entryOnly: false,
    }),
    // new webpack.ProvidePlugin({
    //   addImport: [path.resolve(__dirname, 'addImport'), 'add'],
    // }),
    // new webpack.HotModuleReplacementPlugin(),
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
          options: babelConfigNode,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  node: {
    __dirname: false,
  }
};
