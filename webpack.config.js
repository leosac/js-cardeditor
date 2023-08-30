const path = require('path');

module.exports = {
  entry: './src/lib/dom.js',
  output: {
    filename: 'cardeditor.js',
    library: 'cardeditor',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false
  },
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
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'  
  }
};