const path = require('path');

module.exports = {
  webpack: {
    publicPath: 'assets/',
    devServerPort: 9000,
  },
  port: 3000,
  serverOutputPath: path.resolve(__dirname, 'build'),
  clientOutputPath: path.resolve(__dirname, 'dist'),
};
