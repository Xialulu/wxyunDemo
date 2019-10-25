// pages/addFunction/addFunction.js
const moment = require('moment');

const code = `// 云函数入口函数
exports.main = (event, context) => {
  console.log(event)
  console.log(context)
  return {
    sum: event.a + event.b
  }
}`


Page({
  data: {
    result: '',
    canIUseClipboard: wx.canIUse('setClipboardData'),
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    month: moment().month()
  },
  onLoad: function(options) {
    const { month} = this.data
    this.getCurrentMon(month);
  },


  getCurrentMon: function(date) {
    const mon = date + 1;
    const year = moment().year();
    const week = moment(`${year}-${mon}-01`).weekday();
    // 当前天数
    const monDays = moment().month(date).daysInMonth();
    // 上个月的天数
    let lastMonDay = moment().month(date - 1).daysInMonth();
    // 下个月的天数
    let nextMonDay = moment().month(date +1 ).daysInMonth();
    console.log('mon', year, mon, week, monDays, lastMonDay, nextMonDay);
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
              at:'now'
            })
          } else if (j > 0) {
            days[j].push({
              day: dayNUm++,
              week: weeks[i],
              at:'now'
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
  }
})