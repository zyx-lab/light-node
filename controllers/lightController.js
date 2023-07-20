const mongoose = require('mongoose');
const Shelf = require('../models/shelfModel');
const Location = require('../models/locationModel');
const catchAsync = require('../utils/catchAsync');
const configService = require('../services/configService');

exports.inStock = catchAsync(async (req, res, next) => {
  const { taskId, duration, locationIds } = req.body;
  const configInstance = configService.getConfigInstance();
  const mode = configInstance.getMode();
  const inColor = configInstance.getInColor();

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
        if (item.status === 1) working.push(item.locationId);
        if (item.status === 3) err.push(item.locationId);
      });

      // 按功能区分颜色
      if (mode === 1) {
        // 更改库位灯
        await Location.updateMany(
          { locationId: { $in: locationIds } },
          {
            color: inColor,
            duration,
            status: 1,
            taskId,
          },
          { runValidators: true, session }
        );

        // 更改货架灯
        const shelfs = locationInfos.map((item) => item.shelf);
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
