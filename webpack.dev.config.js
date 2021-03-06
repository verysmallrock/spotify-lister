const path = require('path')
const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const { merge } = require('webpack-merge')
const common = require('./webpack.common.config.js')

module.exports = merge(common, {
  mode: 'development',
  entry: {
    main: ['babel-polyfill', 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000', './src/js/index.js']
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          emitWarning: true,
          failOnError: false,
          failOnWarning: false
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        // Loads the javacript into html template provided.
        // Entry point is set below in HtmlWebPackPlugin in Plugins 
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            //options: { minimize: true }
          }
        ]
      },
      { 
        test: /\.css$/,
        use: [ 
          'style-loader', 
          { 
            loader: 'css-loader', 
            options: { 
              modules:  { 
                localIdentName: '[name]_[local]--[hash:base64:5]',
                mode: (resourcePath) => {
                  let globalStyles = ['af-virtual-scroll'];
                  return globalStyles.some(globalFile => resourcePath.includes(globalFile)) ? 'global' : 'local'
                }
              }
            } 
          } ]
      },
      {
       test: /\.(png|svg|jpg|gif)$/,
       use: ['file-loader']
      },
      {
       test: /\.ya?ml$/,
       use: 'js-yaml-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/html/index.html",
      filename: "./index.html",
      excludeChunks: [ 'server' ]
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
})