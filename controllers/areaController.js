const Area = require('../models/areaModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.bindLights = catchAsync(async (req, res, next) => {
  const newArea = await Area.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      area: newArea,
    },
  });
});

exports.getArea = catchAsync(async (req, res, next) => {
  const area = await Area.findById(req.params.id);

  if (!area) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      area: area,
    },
  });
});
