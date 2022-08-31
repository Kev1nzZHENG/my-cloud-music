// pages/index/index.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],  //轮播图数据
    recommendList: [], //推荐歌单数据
    rankList: [],  //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    // 获取轮播图数据
    let bannerListData = await request('/banner', { type: 2 });
    this.setData({
      bannerList: bannerListData.banners
    });
    // 获取推荐歌单数据
    let recommendListData = await request('/personalized', { limit: 10 });
    this.setData({
      recommendList: recommendListData.result
    });
    // 获取排行榜数据
    let rankListArr = [];
    let result = await request('/toplist');
    let list = result.list.slice(0, 5);
    list.forEach(async (item) => {
      let playlistResult = await request('/playlist/detail', { id: item.id });
      let rankListItem = { name: item.name, tracks: playlistResult.playlist.tracks }
      rankListArr.push(rankListItem);
      this.setData({
        rankList: rankListArr
      })
    })
    // setTimeout(() => {
    //   this.setData({
    //     rankList: rankListArr
    //   })
    // }, 1000);
  },

  // 跳往每日推荐
  goRecommendSong() {
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong',
    })
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