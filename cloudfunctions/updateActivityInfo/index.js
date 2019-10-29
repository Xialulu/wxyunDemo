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
  console.log('云函数', event, event._id)
  const UserInfoCollection = db.collection('UserActivityInfo');
  let updateDate = { ...event} ;
  delete updateDate['_id'];
  delete updateDate['_openid'];
  console.log('updateDate', updateDate)
  try {
    return await UserInfoCollection.where({
      '_openid': OPENID,
      '_id': event._id
    }).update({
      data: {
        ...updateDate
      }
    })
  } catch (e) {
    console.error(e)
  }


}