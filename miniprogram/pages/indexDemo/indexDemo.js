// pages/addFunction/addFunction.js
// const moment = require('moment');

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
  },
  onLoad: function(options) {

  },


  getCurrentMon: function() {
    
  }
})