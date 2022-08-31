import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], //视频标签列表
    navId: 0, //导航标识
    viedoInfoList: [], //视频标签下的视频
    videoId: '', //视频id标识
    viedoUpdateTimeList: [], //记录video播放的时长
    isTriggered: false, //下拉刷新状态
    offset: 0, //分页
  },

  // 获取视频标签列表
  async getvideoGroupList() {
    let result = await request('/video/group/list');
    this.setData({
      videoGroupList: result.data.slice(0, 20),
      navId: result.data[0].id
    });
    // 获取视频标签下的视频
    this.getvideoList(this.data.navId, this.data.offset)
  },

  //获取视频标签下的视频
  async getvideoList(navId, offset = 0) {
    let result = await request('/video/group', { id: navId, offset });
    let videoList = result.datas.map((item) => {
      item.id = item.data.vid;
      return item
    });
    let viedoMoreInfoList = [...videoList];
    if (viedoMoreInfoList[0].data.urlInfo == null) {
      viedoMoreInfoList.forEach((item) => {
        let result2 = request('/video/url', { id: item.id, offset }).then(res => {
          item.data.urlInfo = res.urls[0]
        })
      })
    }
    let { viedoInfoList } = this.data;
    viedoInfoList.push(...viedoMoreInfoList)
    setTimeout(() => {
      this.setData({
        viedoInfoList,
        isTriggered: false  //关闭下拉刷新
      });
      // 关闭加载提示框
      wx.hideLoading()
    }, 200);
  },

  //
  // 点击切换导航，改变选中的索引
  changeNav(event) {
    let navId = event.currentTarget.dataset.id;
    this.setData({
      navId,
      viedoInfoList: [],//清空消息
      offset: 0
    })
    // 显示正在加载
    wx.showLoading({
      title: '正在加载',
    })
    // 动态获取视频列表数据
    this.getvideoList(this.data.navId)
  },

  // 当开始/继续播放时触发回调
  handlePlay(event) {
    /* 需求
     1.在点击播放的事件中需要找到上一个播放的视频
     2.在播放新视频之前关闭上一个正在播放的视频 */
    /* 单例模式：
    1：需要创建多个对象的场景下，通过一个变量接受，始终保持只有一个对象
    2.节省内存空间 */
    let vid = event.currentTarget.id;
    //如果有实例则暂停,暂停上一个视频
    // this.vid !== vid && this.viedoContext && this.viedoContext.stop();
    // 创建新的实例，指向目前的视频
    this.vid = vid;
    this.setData({
      videoId: vid
    })

    // 
    this.viedoContext = wx.createVideoContext(vid);
    let { viedoUpdateTimeList } = this.data;
    // 找到播放的该视频
    let viedoItem = viedoUpdateTimeList.find(item => item.vid == vid);
    // 判断是否播放过
    if (viedoItem) {
      // 跳到上次播放时间
      this.viedoContext.seek(viedoItem.currentTime);
    }

  },

  // 播放视频时的回调
  handleTimeUpadate(event) {
    let viedoTimeObj = { vid: event.currentTarget.id, currentTime: event.detail.currentTime };
    let { viedoUpdateTimeList } = this.data;
    // 找到在播放的视频
    let viedoItem = viedoUpdateTimeList.find(item => item.vid == viedoTimeObj.vid);
    // 更新视频存放时间
    if (viedoItem) {
      viedoItem.currentTime = event.detail.currentTime;
    } else {
      viedoUpdateTimeList.push(viedoTimeObj)
    };
    this.setData({
      viedoUpdateTimeList
    })
  },

  // 播放结束的回调
  handlePlayEnd(event) {
    let { viedoUpdateTimeList } = this.data;
    // 找到该视频的索引
    let index = viedoUpdateTimeList.findIndex(item => item.vid == event.currentTarget.id);
    // 移除记录播放时长数组中当前视频的对象
    if (index >= 0) {
      viedoUpdateTimeList.splice(index, 1);
      this.setData({
        viedoUpdateTimeList
      })
    }
  },

  // scroll view下拉刷新
  ScrollRefresh() {
    // 再次发请求，获取最新的视频列表数据
    this.getvideoList(this.data.navId);
  },

  // scroll view下拉到底部
  handleToLower() {
    let { offset, navId, viedoInfoList } = this.data;
    offset++;
    this.setData({
      offset
    })
    this.getvideoList(navId, offset);
    this.setData({
      viedoInfoList
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getvideoGroupList();
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
    console.log('页面下拉刷新');
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
    return {

    }
  }
})