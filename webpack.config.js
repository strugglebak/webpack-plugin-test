const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FileListPlugin = require('./plugins/fileList-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const InlineSourcePlugin = require('./plugins/inlineSource-plugin')
const UploadPlugin = require('./plugins/upload-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://test.strugglebak.com'
  },
  module: {
    rules: [
      { // 这里 MiniCssExtractPlugin.loader 就相当于 style-loader
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'main.css'
    }),
    // new InlineSourcePlugin({
    //   // 匹配 以 js 或 css 结尾的文件
    //   test: /\.(js|css)/
    // }),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new FileListPlugin({
      filename: 'list.md'
    }),
    new UploadPlugin({
      bucket: 'ststatic',
      domain: 'test.strugglebak.com',
    })
  ]
}