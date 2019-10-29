const moment = require('moment');
const code = `// 云函数入口函数
exports.main = (event, context) => {
  console.log(event)
  console.log(context)
  return {
    sum: event.a + event.b
  }
}`

const nowDays = moment().format('YYYY-MM-DD').split('-')[2];
const db = wx.cloud.database();
let openid = '';
Page({
  data: {
    result: '',
    canIUseClipboard: wx.canIUse('setClipboardData'),
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    years: [],
    month: moment().month(),
    nowYear: moment().year(),
    nowDay: nowDays > 10 ? nowDays : nowDays.substring(1, 2),
    sourceDate: []
  },

  onLoad: async function(options) {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel && eventChannel.on) {
      eventChannel.on('changeToNowDate', (data) => {
        const nowMonment = data.data.nowMonment;
        console.log('changeToNowDate', nowMonment);
        this.setData({
          month: moment(nowMonment).month(),
          nowYear: moment(nowMonment).year(),
          nowDay: nowMonment.split('-')[2]
        })
      })
    }
    const {
      month,
      nowYear,
      nowDay
    } = this.data
    this.getCurrentMon(month, nowYear);
    this.getYears();
    openid = await this.getOPenId();
    this.onQuery({
      '_openid': openid,
      ActivityTime: moment(`${nowYear}-${month + 1}-${nowDay}`).format('YYYY-MM-DD')
    });

  },

  getOPenId: async function() {
    try {
      var value = wx.getStorageSync('openid')
      if (value) {
        return value
      }
    } catch (e) {}
  },
  getYears: function() {
    const {
      nowYear,
      years
    } = this.data;

    for (var i = nowYear - 10; i < nowYear + 10; i++) {
      years.push(i);
    }
    console.log('years', years);
  },

  getCurrentMon: function(date, nowYear) {
    const mon = date + 1;
    const year = nowYear;
    const week = moment(`${year}-${mon}-01`).weekday();
    // 当前天数
    const monDays = moment().month(date).daysInMonth();
    // 上个月的天数
    let lastMonDay = moment().month(date - 1).daysInMonth();
    // 下个月的天数
    let nextMonDay = moment().month(date + 1).daysInMonth();
    let {
      weeks,
      days
    } = this.data;
    let dayNUm = 1;
    let nextDayNum = 1;
    for (let j = 0; j < 6; j++) {
      days[j] = [];
      for (var i = 0; i < weeks.length; i++) {
        if (dayNUm > monDays) {
          days[j].push({
            day: nextDayNum++,
            week: weeks[i],
            at: 'next'
          })
        } else {
          if (j == 0 && i >= week) {
            days[j].push({
              day: dayNUm++,
              week: weeks[i],
              at: 'now'
            })
          } else if (j > 0) {
            days[j].push({
              day: dayNUm++,
              week: weeks[i],
              at: 'now'
            })
          } else {
            days[j].push({
              day: lastMonDay--,
              week: weeks[i],
              at: 'last'
            })
          }
        }
      }
    }
    this.setData({
      days
    })
    console.log('days', days)
  },

  onAdd: function(source) {
    db.collection('UserActivityInfo').add({
      data: source,
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id,
          count: 1
        })
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
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

  onQuery: function(params) {
    db.collection('UserActivityInfo').where({
      ...params
    }).get({
      success: res => {
        this.setData({
          sourceDate: res.data,
        });
        console.log('this.data', this.data.sourceDate)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },


  getDetail: function(data) {
    if (!openid) {
      this.judgeIsLogin();
      return false
    }
    const source = data.target.dataset.day;
    const {
      nowYear,
      month
    } = this.data;
    this.setData({
      nowDay: source
    })
    this.onQuery({
      '_openid': openid,
      ActivityTime: moment(`${nowYear}-${month + 1}-${source}`).format('YYYY-MM-DD')
    })
  },

  addInfo: function() {
    if (!openid) {
      this.judgeIsLogin();
      return false;
    }
    const {
      nowYear,
      month,
      nowDay
    } = this.data
    wx.navigateTo({
      url: "../addActivityInfo/addActivityInfo",
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getActivityDetail', {
          data: {
            activityInfoDetail: null,
            isEdit: false,
            nowMonment: moment(`${nowYear}-${month + 1}-${nowDay}`).format("YYYY-MM-DD")
          }
        })
      }
    })
  },

  judgeIsLogin: function() {
    wx.redirectTo({
      url: '../login/login'
    });
  },

  onDelect: function(source) {
    console.log('source', source)
    db.collection('UserActivityInfo').where({
      ...source
    }).remove({
      success: function(res) {
        console.log(res.data)
      }
    })
  },

  removeActivity: function(data) {
    const source = data.target.dataset.id;
    const {
      nowYear,
      month
    } = this.data;
    wx.cloud.callFunction({
      name: 'delectActivityInfo',
      data: {
        '_id': source
      },
      success: res => {
        console.log('[云函数] [login] ', res)
        const {
          nowYear,
          month,
          nowDay
        } = this.data;
        this.onQuery({
          '_openid': openid,
          ActivityTime: moment(`${nowYear}-${month + 1}-${nowDay}`).format('YYYY-MM-DD')
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  updateActivity: function(event) {
    const index = event.target.dataset.index;
    const {
      sourceDate,
      nowYear,
      month,
      nowDay
    } = this.data;
    const date = sourceDate[index];
    console.log('updateActivity', date);
    wx.navigateTo({
      url: "../addActivityInfo/addActivityInfo",
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getActivityDetail', {
          data: {
            activityInfoDetail: date,
            isEdit: true,
            nowMonment: moment(`${nowYear}-${month + 1}-${nowDay}`).format("YYYY-MM-DD")
          }

        })
      }
    })

  }
})