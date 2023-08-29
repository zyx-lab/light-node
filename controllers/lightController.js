const { forEach } = require('lodash');
const Location = require('../models/locationModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const configService = require('../services/configService');
const Seq = require('../utils/seq');
const { updateLightInfo } = require('../mqtt/publishMqtt');
const mqttClient = require('../mqtt/mqttClient');

exports.createTask = catchAsync(async (req, res, next) => {
  const { taskId, taskType, userId, duration, locationIds } = req.body;

  // 获取亮灯颜色
  const configInstance = configService.getConfigInstance();
  const mode = configInstance.getMode();
  let lightColor;
  if (mode === 1) {
    switch (taskType) {
      case 1:
        lightColor = configInstance.getInColor();
        break;
      case 2:
        lightColor = configInstance.getOutColor();
        break;
      case 3:
        lightColor = configInstance.getCheckColor();
        break;
      default:
    }
  } else {
    const userColor = await User.findOne({ userId }).populate({
      path: 'color',
    });
    if (!userColor || !userColor.color) {
      return next(new AppError('Not found color', 400));
    }
    const { color } = userColor;
    const { inColor, outColor, checkColor } = color;
    switch (taskType) {
      case 1:
        lightColor = inColor;
        break;
      case 2:
        lightColor = outColor;
        break;
      case 3:
        lightColor = checkColor;
        break;
      default:
    }
  }
  if (!lightColor) return next(new AppError('Not found color', 400));

  // 查询无效库位和正在工作的库位
  const locationInfos = await Location.find(
    {
      locationId: { $in: locationIds },
    },
    { _id: 0, locationId: 1, lightId: 1, shelf: 1, realStatus: 1, topic: 1 }
  ).populate({ path: 'shelf', select: 'lightId topic' });

  const notExist = [];
  const working = [];
  locationIds.forEach((item) => {
    const location = locationInfos.find((loc) => loc.locationId === item);
    if (!location) notExist.push(item);
  });

  // 按主题分类统计lightId
  const lightTopics = {};
  locationInfos.forEach((item) => {
    const { shelf = {}, locationId, lightId, topic } = item;
    if (item.status === 1 || item.status === 2) {
      working.push(locationId);
    } else {
      if (!lightTopics[topic]) {
        lightTopics[topic] = new Set();
      }
      lightTopics[topic].add(lightId);

      if (shelf.topic && shelf.lightId) {
        if (!lightTopics[shelf.topic]) {
          lightTopics[shelf.topic] = [];
        }
        lightTopics[shelf.topic].add(shelf.lightId);
      }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      notExist,
      working,
    },
  });

  // 给硬件发送亮灯指令
  forEach(lightTopics, async (lights, topic) => {
    try {
      const seq = Seq.get();
      await Message.findOneAndUpdate(
        { seq },
        {
          seq,
          type: 2,
          taskId,
          color: lightColor,
          duration,
          status: 0,
          $set: { lightIds: [...lights] },
        },
        { runValidators: true, upsert: true, new: true }
      );
      const message = updateLightInfo(
        seq,
        lights.size,
        duration,
        lightColor,
        2,
        [...lights]
      );
      mqttClient.publishMessage(`/andon/${topic}`, message);
    } catch (err) {
      console.error(err);
    }
  });
});

exports.process = catchAsync(async (req, res, next) => {
  const { locationId } = req.body;
  const newLocation = await Location.findOneAndUpdate(
    { locationId },
    { runValidators: true, new: true }
  ).populate({ path: 'shelf', select: 'lightId topic' });
  if (!newLocation) return next(new AppError('Not found location', 400));

  const lightTopics = {};
  const { duration, color, lightId, topic, taskId, shelf = {} } = newLocation;
  if (!lightTopics[topic]) {
    lightTopics[topic] = [];
  }
  lightTopics[topic].push(lightId);

  if (shelf) {
    if (!lightTopics[shelf.topic]) {
      lightTopics[shelf.topic] = [];
    }
    lightTopics[shelf.topic].push(shelf.lightId);
  }

  res.status(200).json({
    status: 'success',
  });
  // 给硬件发送亮灯指令
  forEach(lightTopics, async (lights, _topic) => {
    try {
      const seq = Seq.get();
      await Message.findOneAndUpdate(
        { seq },
        {
          seq,
          type: 1,
          taskId,
          color,
          duration,
          status: 0,
          $set: { lightIds: lights },
        },
        { runValidators: true, upsert: true, new: true }
      );
      const message = updateLightInfo(
        seq,
        lights.length,
        duration,
        color,
        1,
        lights
      );
      mqttClient.publishMessage(`/andon/${_topic}`, message);
    } catch (err) {
      console.error(err);
    }
  });
});

exports.openLight = catchAsync(async (req, res, next) => {
  const { lightIds, color, duration } = req.body;

  const locationInfos = await Location.find(
    {
      lightId: { $in: lightIds },
    },
    { _id: 0, locationId: 1, lightId: 1, topic: 1 }
  );

  // 按主题分类统计lightId
  const lightTopics = {};
  locationInfos.forEach((item) => {
    const { lightId, topic } = item;
    if (!lightTopics[topic]) {
      lightTopics[topic] = new Set();
    }
    lightTopics[topic].add(lightId);
  });

  // 给硬件发送亮灯指令
  forEach(lightTopics, async (_lightIds, topic) => {
    try {
      const seq = Seq.get();
      await Message.findOneAndUpdate(
        { seq },
        {
          seq,
          type: 2,
          taskId: '',
          color,
          duration,
          status: 0,
          $set: { lightIds: [..._lightIds] },
        },
        { runValidators: true, upsert: true, new: true }
      );
      const message = updateLightInfo(seq, _lightIds.size, duration, color, 2, [
        ..._lightIds,
      ]);
      console.log(message);
      mqttClient.publishMessage(`/andon/${topic}9`, message);
    } catch (err) {
      console.error(err);
    }
  });

  res.status(200).json({
    code: '200',
    data: {},
  });
});

exports.blinkLight = catchAsync(async (req, res, next) => {
  const { lightIds, color, duration } = req.body;

  const locationInfos = await Location.find(
    {
      lightId: { $in: lightIds },
    },
    { _id: 0, locationId: 1, lightId: 1, topic: 1 }
  );

  // 按主题分类统计lightId
  const lightTopics = {};
  locationInfos.forEach((item) => {
    const { lightId, topic } = item;
    if (!lightTopics[topic]) {
      lightTopics[topic] = new Set();
    }
    lightTopics[topic].add(lightId);
  });

  // 给硬件发送亮灯指令
  forEach(lightTopics, async (_lightIds, topic) => {
    try {
      const seq = Seq.get();
      await Message.findOneAndUpdate(
        { seq },
        {
          seq,
          type: 1,
          taskId: '',
          color,
          duration,
          status: 0,
          $set: { lightIds: [..._lightIds] },
        },
        { runValidators: true, upsert: true, new: true }
      );
      const message = updateLightInfo(seq, _lightIds.size, duration, color, 1, [
        ..._lightIds,
      ]);
      console.log(message);
      mqttClient.publishMessage(`/andon/${topic}9`, message);
    } catch (err) {
      console.error(err);
    }
  });

  res.status(200).json({
    code: '200',
    data: {},
  });
});

exports.closeLight = catchAsync(async (req, res, next) => {
  const { lightIds } = req.body;

  const locationInfos = await Location.find(
    {
      lightId: { $in: lightIds },
    },
    { _id: 0, locationId: 1, lightId: 1, topic: 1 }
  );

  // 按主题分类统计lightId
  const lightTopics = {};
  locationInfos.forEach((item) => {
    const { lightId, topic } = item;
    if (!lightTopics[topic]) {
      lightTopics[topic] = new Set();
    }
    lightTopics[topic].add(lightId);
  });

  // 给硬件发送亮灯指令
  forEach(lightTopics, async (_lightIds, topic) => {
    try {
      const seq = Seq.get();
      await Message.findOneAndUpdate(
        { seq },
        {
          seq,
          type: 0,
          taskId: '',
          color: '',
          duration: 0,
          status: 0,
          $set: { lightIds: [..._lightIds] },
        },
        { runValidators: true, upsert: true, new: true }
      );
      const message = updateLightInfo(seq, _lightIds.size, 0, '000000', 0, [
        ..._lightIds,
      ]);
      console.log('message', message);
      mqttClient.publishMessage(`/andon/${topic}9`, message);
    } catch (err) {
      console.error(err);
    }
  });

  res.status(200).json({
    code: '200',
    data: {},
  });
});
