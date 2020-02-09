const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FileListPlugin = require('./plugins/fileList-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new FileListPlugin({
      filename: './list.md'
    })
  ]
}