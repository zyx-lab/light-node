const mongoose = require('mongoose');
const Color = require('../models/colorModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createColor = catchAsync(async (req, res, next) => {
  const { name, inColor, outColor, checkColor } = req.body;
  const newColor = await Color.create({
    name,
    inColor,
    outColor,
    checkColor,
  });

  res.status(201).json({
    status: 'success',
    data: {
      color: newColor,
    },
  });
});

exports.updateColor = catchAsync(async (req, res, next) => {
  const { _id, name, inColor, outColor, checkColor } = req.body;
  const newColor = await Color.findByIdAndUpdate(
    { _id },
    {
      name,
      inColor,
      outColor,
      checkColor,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!newColor) {
    return next(new AppError('Not found color', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      newColor,
    },
  });
});

exports.deleteColor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
  };

  try {
    await session.withTransaction(async () => {
      const users = await User.find({ color: id });
      if (users.length > 0) {
        return next(
          new AppError(
            'Color is associated with users and cannot be deleted',
            400
          )
        );
      }

      const color = await Color.findByIdAndDelete(id);
      if (!color) {
        return next(new AppError('Not found color', 404));
      }
      res.status(204).end();
    }, transactionOptions);
  } finally {
    await session.endSession();
  }
});
