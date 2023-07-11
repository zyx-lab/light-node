const Area = require('../models/areaModel');

exports.bindLights = async (req, res, next) => {
  const newArea = await Area.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newArea,
    },
  });
};
