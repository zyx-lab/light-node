const { forEach } = require('lodash');
const mongoose = require('mongoose');
const Shelf = require('../models/shelfModel');
const Location = require('../models/locationModel');
const Message = require('../models/messageModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { updateLightInfo } = require('../mqtt/publishMqtt');
const mqttClient = require('../mqtt/mqttClient');
const Seq = require('../utils/seq');

exports.saveShelf = catchAsync(async (req, res, next) => {
  const { _id, shelfId, lightId, topic } = req.body;
  let newShelf;
  if (_id) {
    // 修改
    newShelf = await Shelf.findByIdAndUpdate(
      _id,
      {
        shelfId: shelfId,
        lightId: lightId,
        topic: topic,
      },
      { runValidators: true, new: true }
    );
  } else {
    // 新建
    newShelf = await Shelf.create({
      shelfId: shelfId,
      lightId: lightId,
      topic: topic,
      status: 0,
    });
  }
  res.status(200).json({
    code: '200',
    data: {
      shlef: newShelf,
    },
  });
});

exports.deleteShelf = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
  };

  try {
    await session.withTransaction(async () => {}, transactionOptions);
    const shelf = await Shelf.findByIdAndDelete(req.query.id);

    await Location.deleteMany({ shelf: req.query.id });

    if (shelf) {
      return res.status(200).json({
        code: '204',
        data: shelf,
      });
    }
    return res.status(200).json({
      code: '404',
      message: '货架不存在',
    });
  } finally {
    await session.endSession();
  }
});

exports.updateShelf = catchAsync(async (req, res, next) => {
  const shelf = await Shelf.findOneAndUpdate(
    { shelfId: req.params.shelfId },
    { lightId: req.body.lightId },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!shelf) {
    return next(new AppError('Invalid shelf ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      shelf,
    },
  });
});

exports.getAllShelves = catchAsync(async (req, res, next) => {
  const { status, pageNo, pageSize } = req.query;
  const query = {};
  // 筛选
  if (status && status >= 0) query.status = status;

  // 分页
  const page = pageNo * 1 || 1;
  const limit = pageSize * 1 || 10;
  const skip = (page - 1) * limit;

  const count = await Shelf.countDocuments(query);
  const resShelves = await Shelf.find(query).skip(skip).limit(limit);

  res.status(200).json({
    code: '200',
    data: {
      list: resShelves,
      pageNo: pageNo * 1,
      pageSize: pageSize * 1,
      totalCount: count,
      totalPage: Math.ceil(count / (pageSize * 1)),
    },
  });
});

exports.getShelf = catchAsync(async (req, res, next) => {
  const shelf = await Shelf.findOne({ shelfId: req.params.shelfId });
  if (!shelf) {
    return next(new AppError('Invalid shelf ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      shelf,
    },
  });
});

exports.openLight = catchAsync(async (req, res, next) => {
  const { lightIds, color, duration } = req.body;

  const locationInfos = await Shelf.find(
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

  const locationInfos = await Shelf.find(
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

  const locationInfos = await Shelf.find(
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
