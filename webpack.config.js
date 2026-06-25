const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  return {
    entry: isProd ? './src/lib/dom.js' : './src/index.js',
    output: {
      filename: 'cardeditor.js',
      chunkFilename: '[name].js',
      publicPath: 'auto',
      library: 'cardeditor',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    optimization: {
      minimize: false
    },
    plugins: [
	  new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html'
      })
    ],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: {node: "current"} }],
                "@babel/preset-react"
              ]
            }
          }
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /src\/locales\/*\/.json/,
          loader: "@alienfast/i18next-loader",
        }
      ],
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      port: 3000,
      hot: true,
      historyApiFallback: true
    },
    externals: isProd ? {
      'react': 'React',
      'react-dom': 'ReactDOM'  
    } : {}
  };
};