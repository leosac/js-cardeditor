const path = require('path');

module.exports = {
  entry: './cardeditor.js',
  output: {
    filename: 'cardeditor.js',
    library: 'cardeditor'
  },
  module: {
    rules: [
      {
        test: /src\/locales\/*\/.json/,
        loader: "@alienfast/i18next-loader",
      }
    ],
  }
};