import request from '../../utils/request'
let startY = 0;  //手指起始位置
let endY = 0; //手指结束位置
let distance = 0; //手指移动距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coverTransition: '',
    userInfo: {}, //用户个人信息
    recentList: [], //最近播放列表
  },
  // 手指移动开始
  handleTouchStart(event) {
    this.setData({
      coverTransition: ''
    })
    // 获取手指起始位置坐标
    startY = event.touches[0].clientY;
  },
  // 手指移动
  handleTouchMove(event) {
    endY = event.touches[0].clientY;
    distance = endY - startY;
    if (distance <= 0) {
      return;
    }
    if (distance >= 80) {
      distance = 80;
    }
    this.setData({
      coverTransform: `translateY(${distance}rpx)`
    })
  },
  // 手指移动结束
  handleTouchEnd() {
    this.setData({
      coverTransform: 'translateY(0)',
      coverTransition: 'transform 0.5s linear'
    })
  },
  // 跳转登陆页面
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  // 获取最近播放记录
  async getRecentList(userId) {
    let recentList = await request('/user/record', { uid: userId, type: 0 });
    this.setData({
      recentList: recentList.allData.slice(0, 10).map(item => {
        item.id = item.song.id;
        return item
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 存储用户信息
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
    };
    // 存储播放记录
    this.getRecentList(this.data.userInfo.userId);
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