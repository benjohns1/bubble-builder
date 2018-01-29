/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
});

module.exports = {
    entry: './null.js',
    output: {
      path: path.join(__dirname, "build"),
      filename: 'null.js'
    },
    devServer: {
      inline: true,
      contentBase: './build',
      port: 3000
    },
    module: {
      loaders: []
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'client' },
        { from: 'node_modules/phaser/build/phaser.js', to: 'lib/phaser.js' },
        { from: 'node_modules/@orange-games/phaser-input/build/phaser-input.js', to: 'lib/phaser-input.js' },
        { from: 'node_modules/@orange-games/phaser-nineslice/build/phaser-nineslice.js', to: 'lib/phaser-nineslice.js' }
      ])
    ]
  }