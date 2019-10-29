// pages/addFunction/addFunction.js
const moment = require('moment');
const db = wx.cloud.database();

Page({
  data: {
    isShowDate: false,
    ActivityTime: null,
    activityInfoDetail: {
      ActivityName: null,
      ActivityTime: null,
      Description: null,
      GameName: null,
      _id: null
    },
    isEdit: false,
    nowMonment: null
  },
  onLoad: function(options) {
    this.formDate();
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('getActivityDetail', (data) => {
      console.log('getActivityDetail', data)
      this.setData({
        activityInfoDetail: data.data.activityInfoDetail ? data.data.activityInfoDetail : this.data.activityInfoDetail,
        isEdit: data.data.isEdit,
        nowMonment: data.data.nowMonment
      });
      console.log('getActivityDetail', this.data)
    })
  },

  showDate: function() {
    const {
      isShowDate,
      years,
      months,
      days,
      value,
      month,
      day
    } = this.data;
    this.setData({
      isShowDate: !isShowDate,
      ActivityTime: moment(`${years[years.length-1]}-${months[month - 1]}-${days[day - 1]}`).format("YYYY-MM-DD")
    })
    console.log('isShowDate', this.data)
  },

  formDate: function() {
    const date = new Date()
    const years = [];
    const months = [];
    const days = [];
    const year = moment().year();
    const month = moment().month() + 1;
    const day = moment().format("YYYY-MM-DD").split('-')[2];
    for (let i = 1990; i <= date.getFullYear(); i++) {
      years.push(i)
    }

    for (let i = 1; i <= 12; i++) {
      months.push(i)
    }

    for (let i = 1; i <= 31; i++) {
      days.push(i)
    }
    const value = [years.length, month - 1, day - 1]
    this.setData({
      months,
      years,
      days,
      month,
      year,
      day,
      value
    })
  },
  formSubmit: async function(data) {
    console.log('data', data.detail.value)
    const value = data.detail.value;
    const {
      isEdit,
      activityInfoDetail,
      ActivityTime
    } = this.data;
    if (!isEdit) {
      if (!value.ActivityName) {
        console.log('请填写活动名称')
        wx.showToast({
          title: '请填写活动名称',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return;
      }
      if (!value.Description) {
        wx.showToast({
          title: '请填写活动描述',
          icon: 'none',
          duration: 2000,
          mask: true
        });
        return;

      }
      if (!value.GameName) {
        console.log('请填写游戏名称')
        wx.showToast({
          title: '请填写游戏名称',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return;
      }
      if (!ActivityTime) {
        console.log('请填写开始时间')
        wx.showToast({
          title: '请填写开始时间',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return;
      }
      const openid = await this.getOpenId();
      this.onAdd({
        ...value,
        ActivityTime
      });
    } else {
      const time = ActivityTime ? ActivityTime : activityInfoDetail.ActivityTime
      this.onUpdate({
        ...activityInfoDetail,
        ...value,
        ActivityTime: time
      });
    }

  },

  onClose: function() {
    this.setData({
      isShowDate: false
    })
  },
  bindChange: function(e) {
    const val = e.detail.value;
    const {
      years,
      months,
      days,
      activityInfoDetail
    } = this.data
    // this.setData({
    //   year: this.data.years[val[0]],
    //   month: this.data.months[val[1]],
    //   day: this.data.days[val[2]]
    // })
    this.setData({
      ActivityTime: moment(`${years[val[0]]}-${months[val[1]]}-${days[val[2]]}`).format("YYYY-MM-DD"),
    })
    console.log(this.data.ActivityTime, this.data.activityInfoDetail)
  },

  onAdd: function(source) {
    console.log('source', source);
    db.collection('UserActivityInfo').add({
      data: source,
      success: res => {
        wx.showToast({
          title: '新增记录成功',
        });
        wx.navigateTo({
          url: '../index/index',
          success: (res) => {
            // 通过eventChannel向被打开页面传送数据
            res.eventChannel.emit('changeToNowDate', {
              data: {
                nowMonment: this.data.nowMonment
              }
            })
          }
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  onUpdate: function(source) {
    const nowMonment = this.data.nowMonment
    wx.cloud.callFunction({
      name: 'updateActivityInfo',
      data: {
        ...source
      },
      success: res => {
        wx.showToast({
          title: '更新记录成功',
        });
        wx.navigateTo({
          url: '../index/index',
          success: (res) => {
            // 通过eventChannel向被打开页面传送数据
            console.log('nowMonment', nowMonment)
            res.eventChannel.emit('changeToNowDate', {
              data: {
                nowMonment
              }
            })
          }
        });
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  getOpenId: async function() {
    try {
      var value = wx.getStorageSync('openid')
      if (value) {
        return value
      }
    } catch (e) {}
  },
})