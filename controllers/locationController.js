const Location = require('../models/locationModel');
const Shelf = require('../models/shelfModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createLocation = catchAsync(async (req, res, next) => {
  const { locationId, shelfId, lightId, topic } = req.body;
  const shelf = await Shelf.findOne({ shelfId });
  if (!shelf) return next(new AppError('Invalid shelf id', 404));

  const newLocation = await Location.create({
    locationId: locationId,
    shelf: shelf._id,
    lightId: lightId,
    topic,
  });
  res.status(201).json({
    status: 'success',
    data: {
      location: newLocation,
    },
  });
});

exports.deleteLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findOneAndDelete({
    locationId: req.params.locationId,
  });

  if (!location) {
    return next(new AppError('Invalid location ID', 404));
  }
  res.status(204).end();
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
  const features = new APIFeatures(Location.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const locations = await features.query;
  res.status(200).json({
    status: 'success',
    results: locations.length,
    data: {
      locations,
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
