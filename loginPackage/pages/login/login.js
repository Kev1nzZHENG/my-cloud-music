import request from '../../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', //手机号
    password: '', //密码
  },

  // 登陆回调
  async login() {
    let { phone, password } = this.data;
    // 前端验证：校验格式
    // 手机不能为空
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'error'
      })
      return;
    };
    // 定义正则表达式
    let phoneReg = /^1[3-8][0-9]{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'error'
      });
      return;
    };
    // 手机不能为空
    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'error'
      });
      return;
    }
    // 后端验证：发送请求
    let result = await request('/login/cellphone', { phone, password, isLogin: true });
    if (result.code === 200) { 
      wx.showToast({
        title: '登陆成功'
      });
      // 将用户信息存储至本地
      wx.setStorageSync('userInfo', JSON.stringify(result.profile));
      // 登陆成功后，跳转个人中心
      wx.reLaunch({
        url: '/pages/personal/personal',
      });

    } else if (result.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: 'error',
      })
    } else if (result.code === 400) {
      wx.showToast({
        title: '手机号错误',
        icon: 'error',
      })
    } else {
      wx.showToast({
        title: '登陆错误，请稍后重试 ',
        icon: 'error',
      })
    }

  },

  // 输入框输入回调
  handleInput(event) {
    // 收集输入信息
    let type = event.currentTarget.dataset.type;
    this.setData({
      [type]: event.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})