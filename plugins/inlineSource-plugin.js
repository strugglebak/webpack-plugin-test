// 因为最后是改变 html 的 tag 然后插入到 html 中的，所以这里会使用到
// html-webpack-plugin 提供的一些 hooks 来供我们使用
// 在 html-webpack-plugin 的基础上开发插件
const HtmlWebpackPlugin = require('html-webpack-plugin')

class InlineSourcePlugin {
  constructor({ test }) {
    // 用于匹配文件的正则，这里主要寻找以 js 或 css 结尾的文件
    this.reg = test
  }

  // 处理一个 tag 的数据
  processTag(tag, compilation) {
    let newTag, url
    const { tagName, attributes } = tag

    if (tagName === 'link' && this.reg.test(attributes.href)) {
      newTag = { 
        tagName: 'style',  
        attributes: { type: 'text/css' }
      }
      url = attributes.href
    }

    if (tagName === 'script' && this.reg.test(attributes.src)) {
      newTag = { 
        tagName: 'script', 
        attributes: { type: 'application/javascript' }
      }
      url = attributes.src
    }

    if (url) {
      // 标签里面插入对应文件的源码
      newTag.innerHTML = compilation.assets[url].source()
      // 既然都把源码怼 html 上了，就应该删除对应的文件
      delete compilation.assets[url]
      return newTag
    }

    return tag
  }

  // 处理引入 tags 的数据
  processTags(data, compilation) {
    const headTags = []
    data.headTags.forEach(headTag => {
      // 处理引入 css 的 link 标签
      headTags.push(this.processTag(headTag, compilation))
    })

    const bodyTags = []
    data.bodyTags.forEach(bodyTag => {
      // 处理引入 script 标签
      bodyTags.push(this.processTag(bodyTag, compilation))
    })

    return { ...data, headTags, bodyTags }
  }

  apply (compiler) {
    compiler.hooks.compilation.tap('InlineSourcePlugin', (compilation) => {
      console.log('The compiler is starting a new compilation...')

      // 静态插件接口 | compilation | HOOK NAME | register listener 
      // 使用 alterAssetTagGroups 这个 hooks
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
        'alterPlugin', // 为堆栈取名
        (data, cb) => {
          // 处理 html 的某些 tags, 这里需要做处理的是 css 和 js
          const newData = this.processTags(data, compilation)
          // 返回 data
          cb(null, newData)
        }
      )
    })
  }
}

module.exports = InlineSourcePlugin