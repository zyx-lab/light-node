const mongoose = require('mongoose');
const Shelf = require('../models/shelfModel');
const Location = require('../models/locationModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const configService = require('../services/configService');
const { updateLightInfo } = require('../mqtt/publish');

const filterLocation = (locationInfos, locationIds) => {
  const notExist = [];
  const working = [];
  const err = [];
  const normal = [];
  const lightIds = [];
  locationIds.forEach((item) => {
    const location = locationInfos.find((loc) => loc.locationId === item);
    if (!location) notExist.push(item);
  });
  locationInfos.forEach((item) => {
    if (item.status === 1 || item.status === 2) working.push(item.locationId);
    if (item.status === 3) err.push(item.locationId);
    if (item.status === 0) {
      normal.push(item.locationId);
      lightIds.push(item.lightId);
    }
  });

  return {
    notExist,
    working,
    err,
    normal,
    lightIds,
  };
};

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
      ).populate({ path: 'shelf', select: 'lightId' });

      const { notExist, working, err, normal, lightIds } = filterLocation(
        locationInfos,
        locationIds
      );

      if (normal.length) {
        // 更改库位灯
        await Location.updateMany(
          { locationId: { $in: normal } },
          {
            color: inColor,
            duration,
            status: 2,
            taskId,
            taskType: 1,
            userId,
          },
          { runValidators: true, session }
        );

        // 更改货架灯
        const shelfs = [];
        locationInfos.forEach((item) => {
          const { locationId, shelf } = item;
          const { _id, lightId } = shelf || {};
          if (normal.includes(locationId)) {
            shelfs.push(_id);
            lightIds.push(lightId);
          }
        });

        await Shelf.updateMany(
          {
            _id: { $in: shelfs },
          },
          {
            color: inColor,
            duration,
            status: 2,
          },
          { runValidators: true, session }
        );
      }

      updateLightInfo(lightIds.length, duration, inColor, 2, lightIds);

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

exports.outStock = catchAsync(async (req, res, next) => {
  const { taskId, userId, duration, locationIds } = req.body;
  const configInstance = configService.getConfigInstance();
  const mode = configInstance.getMode();
  let outColor;
  if (mode === 1) {
    outColor = configInstance.getOutColor();
  } else {
    const userColor = await User.findOne({ userId }).populate({
      path: 'color',
      select: 'outColor',
    });
    if (!userColor || !userColor.color)
      return next(new AppError('Not found user color', 400));
    const { color } = userColor;
    ({ outColor } = color);
  }
  if (!outColor) return next(new AppError('Not found outColor', 400));

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
      ).populate({ path: 'shelf', select: 'lightId' });

      const { notExist, working, err, normal, lightIds } = filterLocation(
        locationInfos,
        locationIds
      );

      if (normal.length) {
        // 更改库位灯
        await Location.updateMany(
          { locationId: { $in: normal } },
          {
            color: outColor,
            duration,
            status: 2,
            taskId,
            taskType: 2,
            userId,
          },
          { runValidators: true, session }
        );

        // 更改货架灯
        const shelfs = [];
        locationInfos.forEach((item) => {
          const { locationId, shelf } = item;
          const { _id, lightId } = shelf || {};
          if (normal.includes(locationId)) {
            shelfs.push(_id);
            lightIds.push(lightId);
          }
        });
        await Shelf.updateMany(
          {
            _id: { $in: shelfs },
          },
          {
            color: outColor,
            duration,
            status: 2,
          },
          { runValidators: true, session }
        );
      }

      updateLightInfo(lightIds.length, duration, outColor, 2, lightIds);

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

exports.checkStock = catchAsync(async (req, res, next) => {
  const { taskId, userId, duration, locationIds } = req.body;
  const configInstance = configService.getConfigInstance();
  const mode = configInstance.getMode();
  let checkColor;
  if (mode === 1) {
    checkColor = configInstance.getCheckColor();
  } else {
    const userColor = await User.findOne({ userId }).populate({
      path: 'color',
      select: 'checkColor',
    });
    if (!userColor || !userColor.color)
      return next(new AppError('Not found user color', 400));
    const { color } = userColor;
    ({ checkColor } = color);
  }
  if (!checkColor) return next(new AppError('Not found checkColor', 400));

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
      ).populate({ path: 'shelf', select: 'lightId' });

      const { notExist, working, err, normal, lightIds } = filterLocation(
        locationInfos,
        locationIds
      );

      if (normal.length) {
        // 更改库位灯
        await Location.updateMany(
          { locationId: { $in: normal } },
          {
            color: checkColor,
            duration,
            status: 2,
            taskId,
            taskType: 3,
            userId,
          },
          { runValidators: true, session }
        );

        // 更改货架灯
        const shelfs = [];
        locationInfos.forEach((item) => {
          const { locationId, shelf } = item;
          const { _id, lightId } = shelf || {};
          if (normal.includes(locationId)) {
            shelfs.push(_id);
            lightIds.push(lightId);
          }
        });
        await Shelf.updateMany(
          {
            _id: { $in: shelfs },
          },
          {
            color: checkColor,
            duration,
            status: 2,
          },
          { runValidators: true, session }
        );
      }

      updateLightInfo(lightIds.length, duration, checkColor, 2, lightIds);

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
    { status: 1 },
    { runValidators: true, new: true }
  );

  if (!newLocation) return next(new AppError('Not found location', 400));

  const { duration, color, lightId } = newLocation;
  updateLightInfo(1, duration, color, 1, [lightId]);

  res.status(200).json({
    status: 'success',
    data: {
      location: newLocation,
    },
  });
});

exports.close = catchAsync(async (req, res, next) => {
  const { lightId } = req.body;
  let shelfLightId;
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
        const newShelf = await Shelf.findByIdAndUpdate(newLocation.shelf, {
          status: 0,
        });
        if (!newShelf) return next(new AppError('Not found shelf', 400));
        shelfLightId = newShelf.lightId;
      }
      if (shelfLightId) {
        updateLightInfo(2, 0, '', 0, [lightId, shelfLightId]);
      } else {
        updateLightInfo(1, 0, '', 0, [lightId]);
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
