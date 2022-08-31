// 封装ajax请求

// 服务器基本信息
import config from './config'

// 封装函数
export default (url, data = {}, method = "GET") => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.host + url,
      method,
      data,
      header: {
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
      },
      success: (res) => {
        // 如果请求为登陆
        if (data.isLogin) {
          wx.setStorage({
            key: 'cookies',
            data: res.cookies
          })
        }
        // console.log('请求成功', res);
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
        // console.log('请求失败', err);
      }
    })
  })

}