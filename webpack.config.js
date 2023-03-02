const path = require('path');

module.exports = {
  entry: './src/lib/index.js',
  output: {
    filename: 'cardeditor.js',
    library: 'cardeditor',
    path: path.resolve(__dirname, 'dist'),
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
    'react': 'react',
    'react-dom': 'react-dom',
  }
};