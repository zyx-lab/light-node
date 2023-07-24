const mongoose = require('mongoose');
const Shelf = require('../models/shelfModel');
const Location = require('../models/locationModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const configService = require('../services/configService');

exports.inStock = catchAsync(async (req, res, next) => {
  const { taskId, userId, duration, locationIds } = req.body;
  const configInstance = configService.getConfigInstance();
  const mode = configInstance.getMode();
  let inColor;
  if (mode === 1) {
    inColor = configInstance.getInColor();
  } else {
    const userColor = await User.findOne({ userId }).populate({
      path: 'color',
      select: 'inColor',
    });
    if (!userColor || !userColor.color)
      return next(new AppError('Not found user color', 400));
    const { color } = userColor;
    ({ inColor } = color);
  }
  if (!inColor) return next(new AppError('Not found inColor', 400));

  const session = await mongoose.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
  };

  try {
    await session.withTransaction(async () => {
      const locationInfos = await Location.find(
        {
          locationId: { $in: locationIds },
        },
        { _id: 0, locationId: 1, lightId: 1, shelf: 1, status: 1 }
      );

      const notExist = [];
      const working = [];
      const err = [];
      locationIds.forEach((item) => {
        const location = locationInfos.find((loc) => loc.locationId === item);
        if (!location) notExist.push(item);
      });
      locationInfos.forEach((item) => {
        if (item.status === 1 || item.status === 2)
          working.push(item.locationId);
        if (item.status === 3) err.push(item.locationId);
      });
      const normal = locationIds.filter(
        (item) =>
          !notExist.includes(item) &&
          !working.includes(item) &&
          !err.includes(item)
      );

      if (normal.length) {
        // 更改库位灯
        await Location.updateMany(
          { locationId: { $in: normal } },
          {
            color: inColor,
            duration,
            status: 1,
            taskId,
            userId,
          },
          { runValidators: true, session }
        );

        // 更改货架灯
        const shelfs = [];
        locationInfos.forEach((item) => {
          if (normal.includes(item.locationId)) {
            shelfs.push(item.shelf);
          }
        });
        await Shelf.updateMany(
          {
            _id: { $in: shelfs },
          },
          {
            color: inColor,
            duration,
            status: 1,
          },
          { runValidators: true, session }
        );
      }
      res.status(200).json({
        status: 'success',
        data: {
          notExist,
          working,
          err,
        },
      });
    }, transactionOptions);
  } finally {
    await session.endSession();
  }
});

exports.process = catchAsync(async (req, res, next) => {
  const { locationId } = req.body;
  const newLocation = await Location.findOneAndUpdate(
    { locationId },
    { status: 2 },
    { runValidators: true, new: true }
  );

  if (!newLocation) return next(new AppError('Not found location', 400));
  res.status(200).json({
    status: 'success',
    data: {
      location: newLocation,
    },
  });
});

exports.close = catchAsync(async (req, res, next) => {
  const { lightId } = req.body;

  const session = await mongoose.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
  };

  try {
    await session.withTransaction(async () => {
      // 关闭库位灯
      const newLocation = await Location.findOneAndUpdate(
        { lightId },
        { status: 0 },
        { runValidators: true, new: true }
      );
      if (!newLocation) return next(new AppError('Not found location', 400));

      // 关闭货架灯
      const shelfs = await Location.find({
        shelf: newLocation.shelf,
        status: { $in: [1, 2] },
      });
      if (!shelfs.length) {
        await Shelf.findByIdAndUpdate(newLocation.shelf, {
          status: 0,
        });
      }
      res.status(200).json({
        status: 'success',
        data: {
          location: newLocation,
        },
      });
    }, transactionOptions);
  } finally {
    await session.endSession();
  }
});
