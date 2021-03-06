/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './null.js',
    output: {
      path: path.join(__dirname, "dev_build"),
      filename: 'null.js'
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