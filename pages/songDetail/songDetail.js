import moment from 'moment';
import PubSub from 'pubsub-js';
moment
import request from '../../utils/request'
// 获取全局实例
const appInstance = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPlay: true,  //音乐播放状态
        MusicDetail: {}, //歌曲详情对象
        musicId: 0, //音乐ID
        currentTime: '00:00', //当前播放时长
        duration: 0,//总时长未转换
        durationTime: "00:00", //总时长
        currentWidth: 0, //当前播放条长度
        playType: 'order', //播放顺序
        musicUrl: '', //音乐链接
        lyric: [],//歌词
        lyricTime: 0,//歌词对应的时间
        currentLyric: "",//当前歌词对象
    },
    // 更换播放类型
    changePlayOrder(event) {
        if (event.target.id == 'order') {
            this.setData({
                playType: 'cycle',
            })
        } else if (event.target.id == 'cycle') {
            this.setData({
                playType: 'random',
            })
        } else {
            this.setData({
                playType: 'order',
            })
        }
    },
    //   返回上级导航
    goBack() {
        wx.navigateBack();
    },
    // 控制播放
    controlPlay() {
        // 切换播放状态
        this.setData({
            isPlay: !this.data.isPlay
        })
        let { isPlay } = this.data;
        this.musicControl(isPlay);
    },

    // 控制音乐播放/暂停的功能
    musicControl(isPlay) {
        if (isPlay) {
            // 播放
            this.music.play();
        } else {
            // 暂停
            this.music.pause();
        }
    },

    // 获取音乐播放连接
    async getMusicPlayUrl() {
        // 获取音乐播放链接
        let musicId = this.data.musicId;
        let musicUrlInfo = await request('/song/url', { id: musicId });
        // 给实例添加播放相关属性
        this.music.src = musicUrlInfo.data[0].url;
        this.music.title = this.data.MusicDetail.name;
        this.setData({
            musicUrl: musicUrlInfo.data[0].url
        })
    },

    //获取音乐相关信息
    async getMusicDetail(musicId) {
        let songData = await request('/song/detail', { ids: musicId })
        let durationTime = moment(songData.songs[0].dt).format('mm:ss')
        this.setData({
            MusicDetail: songData.songs[0],
            durationTime,
            duration: songData.songs[0].dt
        })
    },


    //修改播放状态的功能函数
    changePlayState(isPlay) {
        this.setData({
            isPlay
        });
        // 修改全局变量
        appInstance.globalData.isMusicPlay = isPlay;
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // options接受路由的query参数
        let musicId = options.musicId;
        this.setData({
            musicId
        })
        // 获取音乐详情
        this.getMusicDetail(musicId);
        // 获取歌词
        this.getLyric(musicId)

        // 问题：如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实音乐播放状态不一致
        /* 解决方案；
            通过控制音频的实例去监视音乐的播放/暂停 
       */
        //   判断当前页面音乐是否在播放
        if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId == musicId) {
            // 修改当前页面
            this.setData({
                isPlay: true
            })
        }
        this.music = wx.getBackgroundAudioManager();
        // 播放回调
        this.music.onPlay(() => {
            // 修改播放状态
            this.changePlayState(true);
            // 修改全局音乐播放状态
            appInstance.globalData.musicId = musicId;
        });
        // 暂停回调
        this.music.onPause(() => {
            // 修改播放状态
            // 暂停音乐
            this.music.pause();
            this.changePlayState(false);
        });
        // 关闭回调
        this.music.onStop(() => {
            // 修改播放状态
            this.changePlayState(false);
        });
        // 播放结束回调
        this.music.onEnded(() => {
            let { playType } = this.data;
            //循环播放
            if (playType == 'cycle') {
                this.music.src = this.data.musicUrl;
                this.music.title = this.data.MusicDetail.name;
            } else {
                // 订阅音乐id
                this.SubcribeMusicId();
                // 播放下一首
                PubSub.publish('switchType', { playType: playType, type: 'next' });
            }
            // 进度条，当前播放时间归零
            this.setData({
                currentTime: '00:00',
                currentWidth: 0
            })
        });
        // 音乐播放实时进度回调
        this.music.onTimeUpdate(() => {
            // 实例的实时播放时长单位为s    moment的单位为毫秒
            //console.log('总时长', this.music.duration);
            //console.log('实时时长', this.music.currentTime);
            let currentTime = moment(this.music.currentTime * 1000).format('mm:ss');
            let currentWidth = this.music.currentTime / this.music.duration * 100;
            this.setData({
                currentTime,
                currentWidth
            })
            let lyricTime = Math.ceil(this.music.currentTime);
            this.setData({
                lyricTime
            })
            //获取当前歌词
            this.getCurrentLyric();
        })
    },

    SubcribeMusicId() {
        // 订阅音乐id
        PubSub.subscribe('musicId', (event, musicId) => {
            this.setData({
                musicId
            })
            // 更新音乐信息=>页面详情
            this.getMusicDetail(musicId);
            // 更新音乐的url
            this.getMusicPlayUrl();
        })
    },

    // 处理歌曲切换
    handleSwtich(event) {
        let type = event.currentTarget.dataset.type;
        let { playType } = this.data;
        // 关闭当前播放的音乐
        this.music.stop();
        // 订阅音乐id
        PubSub.subscribe('musicId', (event, musicId) => {
            this.setData({
                musicId
            })
            // 更新音乐信息=>页面详情
            this.getMusicDetail(musicId);
            //获得歌词
            this.getLyric(musicId);
            // 更新音乐的url
            this.getMusicPlayUrl();
            // 取消订阅（避免一次触发多个订阅事件）
            PubSub.unsubscribe('musicId')
        })
        // 发布消息给recommendSong页面
        PubSub.publish('switchType', { playType: playType, type: type })
    },

    // 进度条拖拽
    handleSlider(event) {
        let { duration } = this.data;
        let playCurrent = event.detail.value * duration / 100 / 1000;
        playCurrent = playCurrent.toFixed(2) * 1; //保留两位小数，转换number类型
        this.music.seek(playCurrent)
    },

    // 歌词
    //获取歌词
    async getLyric(musicId) {
        let lyricData = await request("/lyric", { id: musicId });
        let lyric = this.formatLyric(lyricData.lrc.lyric);
    },
    //传入初始歌词文本text
    formatLyric(text) {
        let lyric = [];
        let arr = text.split("\n"); //原歌词文本已经换好行了方便很多，我们直接通过换行符“\n”进行切割
        let row = arr.length; //获取歌词行数
        for (let i = 0; i < row; i++) {
            let temp_row = arr[i]; //现在每一行格式大概就是这样"[02:10.00]hello world";
            let temp_arr = temp_row.split("]");//我们可以通过“]”对时间和文本进行分离
            let text = temp_arr.pop(); //把歌词文本从数组中剔除出来，获取到歌词文本了！
            //再对剩下的歌词时间进行处理
            temp_arr.forEach(element => {
                let obj = {};
                let time_arr = element.substr(1, element.length - 1).split(":");//先把多余的“[”去掉，再分离出分、秒
                let s = parseInt(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
                obj.time = s;
                obj.text = text;
                lyric.push(obj); //每一行歌词对象存到组件的lyric歌词属性里
            });
        }
        lyric.sort(this.sortRule) //由于不同时间的相同歌词我们给排到一起了，所以这里要以时间顺序重新排列一下
        this.setData({
            lyric
        })
    },
    sortRule(a, b) { //设置一下排序规则
        return a.time - b.time;
    },
    //控制歌词播放
    getCurrentLyric() {
        let lyricItem = this.data.lyric.find(item => {
            return item.time == this.data.lyricTime;
        })
        if (lyricItem != undefined) {
            this.setData({
                currentLyric: lyricItem.text
            })
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        let { isPlay } = this.data;
        this.getMusicPlayUrl();
        this.musicControl(isPlay);
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