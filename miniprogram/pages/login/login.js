// pages/addFunction/addFunction.js

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
  },
  pages: [],
  onLoad: function(options) {
    this.pages = getCurrentPages();
    console.log('pages', this.pages)
  },

  onGotUserInfo:async function(e) {
    console.log('onGotUserInfo', e);
    wx.setStorage({
      key: "userInfo",
      data: JSON.stringify(e.detail.userInfo)
    })
    wx.setStorage({
      key: "cloudID",
      data: e.detail.cloudID
    })
    await this.onGetOpenid();
  },

  refuseLogin: function() {
    this.goToIndex();
  },

  goToIndex: function() {
    console.log('pagesgoToIndex', this.pages)
    if (this.pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.redirectTo({
        url: "../indexDemo/indexDemo",
      })
    }

  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        this.goToIndex();
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

})