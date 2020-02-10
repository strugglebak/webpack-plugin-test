const path = require('path')
const fs = require('fs')
const qiniu = require('qiniu')
class UploadPlugin {
  constructor({bucket, domain}) {
    // 初始化七牛云参数以及内部变量
    this.init({bucket, domain})
  }

  apply(compiler) {
    // 上传文件是多个，且返回的是 promise，所以这里用 tapPromise
    compiler.hooks.afterEmit.tapPromise(
      'UploadPlugin',
      (compliation) => {
        const { assets } = compliation
        const promises = []
        for (const [filename, stat] of Object.entries(assets)) {
          promises.push(this.upload(filename))
        }

        return Promise.all(promises)
      }
    )
  }

  // 上传文件
  upload(filename) {
    // 代码参考在 https://developer.qiniu.com/kodo/sdk/1289/nodejs#form-upload-file
    return new Promise((resovle, reject) => {
      // 要上传的本地文件目录为 dist 目录下的
      const localFile = path.resolve(__dirname, '../dist', filename)
      // 使用表单方式上传本地文件
      this.formUploader.putFile(
        this.uploadToken, filename, localFile, this.putExtra, 
        (respErr, respBody, respInfo) => {
        if (respErr) {
          reject(respErr) 
        }
        if (respInfo.statusCode == 200) {
          resovle(respBody)
        }
      })
    })
  }

  init({bucket, domain}) {
    // 读取本地的 qiniu 的密钥文件，这样比较安全
    const keyJSON = fs.readFileSync(
      path.resolve(__dirname, '../', 'qiniu-key.json'),
      'utf8'
    )
    const { accessKey, secretKey } = JSON.parse(keyJSON)
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket })
    const config = new qiniu.conf.Config()

    this.uploadToken = putPolicy.uploadToken(mac)
    this.formUploader = new qiniu.form_up.FormUploader(config)
    this.putExtra = new qiniu.form_up.PutExtra()
    this.domain = domain
  }
}

module.exports = UploadPlugin