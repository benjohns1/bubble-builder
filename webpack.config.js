/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
var pixi = path.join(phaserModule, 'build/custom/pixi.js');
var p2 = path.join(phaserModule, 'build/custom/p2.js');
var phaserInput = path.join(__dirname, '/node_modules/@orange-games/phaser-input/build/phaser-input.js');

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
});

module.exports = {
    entry: './client/index.js',
    output: {
      path: path.join(__dirname, "build"),
      filename: 'bundle.js'
    },
    devServer: {
      inline: true,
      contentBase: './build',
      port: 3000
    },
    module: {
      loaders: [      
        { test: /\.js$/, loader: 'babel-loader', include: __dirname, exclude: /node_modules/ },
        { test: /pixi\.js/, loader: 'expose-loader?PIXI' },
        { test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
        { test: /p2\.js/, loader: 'expose-loader?p2' }
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'client/assets', to: 'assets' } 
      ])
    ],
    resolve: {
      alias: {
        'phaser': phaser,
        'pixi': pixi,
        'p2': p2,
        'phaserInput': phaserInput
      }
    }
  }