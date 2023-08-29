const { makeChecksum } = require('../utils/conversion');
const Location = require('../models/locationModel');
const Shelf = require('../models/shelfModel');
const Message = require('../models/messageModel');

function checkPayloadBcc(payload) {
  let flag = false;
  const bccCode = payload.slice(-2);
  const prepareBCC = payload.slice(0, payload.length - 2);
  if (bccCode === makeChecksum(prepareBCC)) {
    flag = true;
  }
  return flag;
}

async function handleAck(payload) {
  try {
    const seq = parseInt(payload.slice(0, 4), 16);
    const len = parseInt(payload.slice(6, 10), 16);
    console.log('handleAck', payload);
    // 确认消息
    const message = await Message.findOneAndUpdate(
      { seq, status: 0 },
      { status: 1 },
      { runValidators: true, new: true }
    );
    if (!message) return;
    const { type, lightIds, duration, taskId, color } = message;

    // 统计正常和异常的灯带
    let normalLightIds = []; // [1,2,3]
    let errLights = []; // [{lightId,err}]
    if (len === 1) {
      // 正常
      normalLightIds = lightIds;
    } else {
      // 异常
      const quantity = parseInt(payload.slice(10, 14), 16);
      if (len !== 2 + 3 * quantity) return;
      const infos = payload.slice(14, 14 + 6 * quantity);
      if (infos.length !== 6 * quantity) return;
      const errInfos = [];
      let index = 0;
      while (index < quantity * 6) {
        const lightId = parseInt(infos.slice(index, index + 4), 16).toString();
        const err = parseInt(infos.slice(index + 4, index + 6), 16);
        errInfos.push({
          lightId,
          err,
        });
        index += 6;
      }
      errLights = errInfos;
      normalLightIds = lightIds.filter(
        (light) =>
          !errLights.map((errLight) => errLight.lightId).includes(light)
      );
    }

    // 修改正常灯带状态
    let normalLocationIds = [];
    if (normalLightIds.length) {
      await Location.updateMany(
        { lightId: { $in: normalLightIds } },
        {
          color,
          duration,
          status: type,
          // errCode: 0,
          taskId,
          updateTime: new Date(),
        },
        { runValidators: true }
      );
      await Shelf.updateMany(
        {
          lightId: { $in: normalLightIds },
        },
        {
          color: color,
          duration,
          status: type,
          updateTime: new Date(),
        },
        { runValidators: true }
      );
      const normalLocations = await Location.find(
        { lightId: { $in: normalLightIds } },
        { locationId: 1 }
      );
      normalLocationIds = normalLocations.map((item) => item.locationId);
    }

    // 修改异常灯带状态
    errLights.forEach(async (item) => {
      try {
        const { lightId, err } = item;
        await Location.updateMany({ lightId }, { status: 3, errCode: err });
        await Shelf.updateMany({ lightId }, { status: 3, errCode: err });
      } catch (err) {
        console.error(err);
      }
    });

    let errLocationIds = [];
    if (errLights.length) {
      const errLightIds = errLights.map((item) => item.lightId);
      const errLocations = await Location.find(
        { lightId: { $in: errLightIds } },
        { locationId: 1 }
      );
      errLocationIds = errLocations.map((item) => item.locationId);
    }

    if (taskId && type === 1) {
      console.log(
        '调用PDA闪烁成功接口',
        taskId,
        normalLocationIds,
        errLocationIds
      );
    }
    if (taskId && type === 2) {
      console.log(
        '调用PDA亮灯成功接口',
        taskId,
        normalLocationIds,
        errLocationIds
      );
    }
  } catch (err) {
    console.error(err);
  }
}

async function lightError(payload) {
  try {
    const len = parseInt(payload.slice(6, 10), 16);
    const quantity = parseInt(payload.slice(10, 14), 16);
    if (len !== 3 + 2 * quantity) return;
    const infos = payload.slice(14, 14 + 6 * quantity);
    if (infos.length !== 6 * quantity) return;
    const errInfos = [];
    let index = 0;
    while (index < quantity * 6) {
      const lightId = parseInt(infos.slice(index, index + 4), 16).toString();
      const err = parseInt(infos.slice(index + 4, index + 6), 16);
      errInfos.push({
        lightId,
        err,
      });
      index += 6;
    }

    // 修改灯带状态
    errInfos.forEach(async (item) => {
      try {
        const { lightId, err } = item;
        await Location.updateMany({ lightId }, { status: 3, errCode: err });
        await Shelf.updateMany({ lightId }, { status: 3, errCode: err });
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

const lightClose = async (payload) => {
  try {
    const len = parseInt(payload.slice(6, 10), 16);
    const quantity = parseInt(payload.slice(12, 16), 16);
    if (len !== 3 + 2 * quantity) return;
    const lightIdHex = payload.slice(16, 16 + quantity * 4);
    if (lightIdHex.length !== quantity * 4) return;

    const lightIds = [];
    let index = 0;
    while (index < quantity * 4) {
      const lightId = parseInt(
        lightIdHex.slice(index, index + 4),
        16
      ).toString();
      lightIds.push(lightId);
      index += 4;
    }
    console.log('lightClose', lightIds);

    // 查询灯带对应的库位ID和任务ID
    const locationInfos = await Location.find(
      { lightId: { $in: lightIds } },
      { _id: 0, taskId: 1, locationId: 1 }
    );
    // 调用PDA入库完成接口
    console.log('调用PDA入库完成接口', locationInfos);
    // return;

    // 获取需要关闭的lightId
    const locationId = '2';
    const lightTopics = {};
    const locations = await Location.findOne({
      locationId: locationId,
    }).populate({ path: 'shelf', select: 'lightId topic' });

    const { shelf, lightId, topic } = locations;
    if (!lightTopics[topic]) {
      lightTopics[topic] = [];
    }
    lightTopics[topic].push(lightId);

    console.log('shelf', shelf);
    if (shelf) {
      const shelves = await Shelf.find({
        shelf: shelf._id,
        realStatus: { $in: [1, 2] },
      });
      console.log('shelves', shelves);
      if (!shelves.length) {
        if (!lightTopics[shelf.topic]) {
          lightTopics[shelf.topic] = [];
        }
        lightTopics[shelf.topic].push(shelf.lightId);
      }
    }
    console.log('关灯 lightTopics', lightTopics);
    return lightTopics;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { handleAck, lightError, lightClose, checkPayloadBcc };
