const Area = require('../models/areaModel');
const catchAsync = require('../utils/catchAsync');

exports.bindLights = catchAsync(async (req, res, next) => {
  const newArea = await Area.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      area: newArea,
    },
  });
});
