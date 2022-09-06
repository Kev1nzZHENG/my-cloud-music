import PubSub from 'pubsub-js';
import request from '../../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '', //天
    month: '', //月
    recommendList: [], //推荐列表数据
    index: 0 //音乐所在的下标
  },

  // 获取每日推荐的数据
  async getRecommendSongList() {
    let recommendListData = await request('/recommend/songs');
    let { recommendList } = this.data;
    recommendListData.data.dailySongs.forEach(item => {
      let SongItem = { name: item.name, id: item.id, picUrl: item.al.picUrl, singer: item.ar[0].name };
      recommendList.push(SongItem);
      this.setData({
        recommendList: recommendList
      })
    })
  },
  // 跳往歌曲详情页
  toSongDetail(event) {
    let { song, index } = event.currentTarget.dataset;
    this.setData({
      index
    })
    wx.navigateTo({
      url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 判断用户是否登陆
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登陆',
        icon: 'error',
        success: () => {
          wx.reLaunch({
            url: '/loginPackage/pages/login/login'
          })
        }
      })
    }
    // 获取每日推荐歌曲数据
    this.getRecommendSongList();
    // 更新日期时间
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
    })
    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (event, obj) => {
      let { recommendList, index } = this.data;
      // 顺序播放
      if (obj.playType == 'order' || obj.playType == 'cycle') {
        //上一首
        if (obj.type == 'pre') {
          if (index == 0) {
            index = recommendList.length - 1;
          } else {
            index -= 1;
          }

        } else if (obj.type == 'next') {
          //下一首
          if (index == recommendList.length - 1) {
            index = 0;
          } else {
            index += 1;
          }
        }
      }
      // 随机播放
      if (obj.playType == 'random') {
        index = this.getRandomNum(0, recommendList.length - 1);
        while (index == this.data.index) {
          index = this.getRandomNum(0, recommendList.length - 1);
        }
      }

      this.setData({
        index
      })
      let musicId = recommendList[index].id;
      PubSub.publish('musicId', musicId)
    })
  },
  // 获取随机数
  getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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