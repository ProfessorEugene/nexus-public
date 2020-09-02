/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
const CopyModulesPlugin = require('copy-modules-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const path = require('path');
const {NormalModuleReplacementPlugin} = require('webpack');

module.exports = {
  entry: {
    'nexus-coreui-bundle': './src/frontend/src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.js$/,
        include: /node_modules[\/\\]fuse\.js/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png)$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]'
        }
      },
      {
        test: /\.(ttf|eot|woff2?|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new CopyModulesPlugin({
      destination: path.resolve(__dirname, 'target/webpack-modules')
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new NormalModuleReplacementPlugin(
        // Replace scss from the RSC library with empty css since it's already included in nexus-rapture
        // make sure to use path.sep to cover varying OS's
        /.*@sonatype.*\.s?css/,
        function(resource) {
          const RSC_INDEX = resource.request.indexOf(
              'node_modules' + path.sep + '@sonatype' + path.sep + 'react-shared-components');

          resource.request = resource.request.substring(0, RSC_INDEX) + 'buildsupport' + path.sep + 'ui' +
              path.sep + 'empty.scss';
        }
    )
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: {
    axios: 'axios',
    'nexus-ui-plugin': 'nxrmUiPlugin',
    react: 'react',
    xstate: 'xstate'
  }
};
