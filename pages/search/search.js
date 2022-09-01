import PubSub from 'pubsub-js';
import request from '../../utils/request'
let isSend = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', //placeholder内容
    hotList: [], //热搜榜数据
    inputValue: '', //用户输入的表单数据
    searchList: [], //关键字模糊匹配的数据
    historyList: [], //搜索历史记录
  },


  // 获取初始化数据
  async getInitData() {
    // 获取placeholder内容
    let PlaceholderData = await request('/search/default');
    // 获取热搜榜数据
    let hotData = await request('/search/hot/detail');
    let hotList = [];
    hotData.data.forEach((item) => {
      let hotItem = { searchWord: item.searchWord, iconUrl: item.iconUrl };
      hotList.push(hotItem);
    })
    this.setData({
      placeholderContent: PlaceholderData.data.showKeyword,
      hotList
    })
  },

  // 获取模糊数据
  async getSearchList() {
    // 若输入框为空
    if (!this.data.inputValue) {
      // 清楚searchList，从而展示热搜
      this.setData({
        searchList: []
      })
      // 终止函数，不发送请求
      return;
    }
    // 发请求获取关键词模糊数据
    let { inputValue, historyList } = this.data;
    let searchListData = await request('/search', { keywords: inputValue, limit: 10 });
    this.setData({
      searchList: searchListData.result.songs
    })
  },

  //   返回上级导航
  goBack() {
    wx.navigateBack();
  },
  // 点击搜索按钮
  toSearch() {
    // 将搜索的关键字添加到搜索历史记录中
    let { historyList, inputValue } = this.data;
    // 检查是否为空
    if (inputValue == '') {
      return;
    }
    // 检查是否有同样的字段
    let index = historyList.indexOf(inputValue);
    if (index !== -1) {
      historyList.splice(index, 1);
    }
    historyList.unshift(inputValue)
    this.setData({
      historyList,
      searchList: [],// 清空searchList，展示
      inputValue: '',//输入框为空
    })
    wx.setStorageSync('searchHistory', historyList);

  },
  // 输入框input事件
  handleInput(event) {
    this.setData({
      inputValue: event.detail.value.trim()
    });
    // 节流
    if (isSend) {
      setTimeout(() => {
        this.getSearchList()
        isSend = true;
      }, 300)
      isSend = false;
    }
  },
  // 获取本地searchHistroy
  getStoregeHistory() {
    let historyList = wx.getStorageSync('searchHistory');
    if (historyList) {
      this.setData({
        historyList
      })
    }
  },
  // 清空输入信息
  clearInputValue() {
    console.log('clear');
    this.setData({
      inputValue: '',
      searchList: []
    })
  },
  // 清空历史记录
  clearHistory() {
    // 弹出确认框
    wx.showModal({
      content: '确认清空历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空historyList
          this.setData({
            historyList: [],

          })
          // 清空本地storage记录缓存
          wx.removeStorageSync('searchHistory')
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取初始化数据
    this.getInitData();
    // 获取本地searchHistroy
    this.getStoregeHistory();
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