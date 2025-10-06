const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

const CONFIG = {
  entry: './src/js/app.js',
  mode: process.env.NODE_ENV,
  target: 'web',
  devtool: 'cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: devMode ? 'app.js' : 'js/app.[contenthash].js',
  },

  optimization: {
    minimize: !devMode,
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        minifyCSS: true,
        removeComments: true,
      },
    }),
    new HtmlReplaceWebpackPlugin([
      {
        pattern:
          '<script type="text/javascript" src="../build/app.js"></script>',
        replacement: '',
      },
      {
        pattern: '<link rel="stylesheet" href="./css/app.css">',
        replacement: '',
      },
    ]),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : 'css/[name].[contenthash].css',
      chunkFilename: devMode ? '[id].css' : 'css/[id].[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/images/',
          to: 'images/',
        },
        {
          from: 'src/*.txt',
          to: './[name].[ext]',
        },
      ],
    }),

    new ImageminPlugin({
      disable: devMode,
      test: /\.(jpe?g|png|gif|svg)$/i,
      optipng: { optimizationLevel: 3 },
      jpegtran: { progressive: true },
      gifsicle: { optimizationLevel: 1 },
      svgo: {},
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css|scss)$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: true },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]',
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-modules-commonjs'],
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    compress: true,
    port: 3001,
    hot: true,
    client: {
      logging: 'none',
    },
  },
};

if (!devMode) {
  CONFIG.output.publicPath = './';
}

module.exports = CONFIG;
