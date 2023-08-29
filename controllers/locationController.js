const Location = require('../models/locationModel');
const Shelf = require('../models/shelfModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.saveLocation = catchAsync(async (req, res, next) => {
  const { _id, locationId, shelf, lightId, topic } = req.body;
  let newLocation;
  if (_id) {
    // 修改
    newLocation = await Location.findByIdAndUpdate(
      _id,
      {
        locationId,
        shelf,
        lightId,
        topic,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    // 新建
    newLocation = await Location.create({
      locationId,
      shelf,
      lightId,
      topic,
      status: 0,
    });
  }
  res.status(200).json({
    code: '200',
    data: {
      shlef: newLocation,
    },
  });
});

exports.deleteLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByIdAndDelete(req.query.id);

  if (location) {
    return res.status(200).json({
      code: '204',
      data: location,
    });
  }
  return res.status(200).json({
    code: '404',
    message: '货架不存在',
  });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  const { shelfId, lightId } = req.body;
  const shelf = await Shelf.findOne({ shelfId });
  if (!shelf) return next(new AppError('Invalid shelf id', 400));

  const location = await Location.findOneAndUpdate(
    { locationId: req.params.locationId },
    {
      shelf: shelf,
      lightId: lightId,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!location) {
    return next(new AppError('Invalid location ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      location,
    },
  });
});

exports.getAllLocations = catchAsync(async (req, res, next) => {
  const { status, shelf, pageNo, pageSize } = req.query;

  const query = {};
  // 筛选
  if (status && status >= 0) {
    query.status = status;
  }
  if (shelf) {
    query.shelf = shelf;
  }

  // 分页
  const page = pageNo * 1 || 1;
  const limit = pageSize * 1 || 10;
  const skip = (page - 1) * limit;

  const count = await Location.countDocuments({});
  const resShelves = await Location.find(query)
    .populate({ path: 'shelf', select: 'shelfId' })
    .skip(skip)
    .limit(limit);

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

exports.getLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findOne({
    locationId: req.params.locationId,
  });
  if (!location) {
    return next(new AppError('Invalid location ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      location,
    },
  });
});
