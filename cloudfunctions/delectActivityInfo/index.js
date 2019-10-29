// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async(event, context) => {
  const {
    OPENID
  } = cloud.getWXContext();
  console.log('云函数', event, context)
  const UserInfoCollection = db.collection('UserActivityInfo');
  const thisID = await UserInfoCollection.where({
    '_openid': OPENID,
    '_id': event._id
  }).remove();
  console.log('thisID', thisID)

  return {
    'thisID': thisID,
    '_id': event._id
  }
}