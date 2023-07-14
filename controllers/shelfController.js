const Shelf = require('../models/shelfModel');
const Location = require('../models/locationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createShelf = catchAsync(async (req, res, next) => {
  const newShelf = await Shelf.create({
    shelfId: req.body.shelfId,
    lightId: req.body.lightId,
  });

  res.status(201).json({
    status: 'success',
    data: {
      shlef: newShelf,
    },
  });
});

exports.deleteShelf = catchAsync(async (req, res, next) => {
  const { shelfId } = req.params;
  const shelf = await Shelf.findOne({ shelfId });
  if (!shelf) {
    return next(new AppError('Invalid shelf ID', 404));
  }

  const location = await Location.find({ shelf: shelf._id });
  if (location.length > 0)
    return next(
      new AppError('Cannot delete the shelf. It has associated locations.', 409)
    );

  await Shelf.findOneAndDelete({ shelfId });
  res.status(204).end();
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
  const features = new APIFeatures(Shelf.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const shelves = await features.query;
  res.status(200).json({
    status: 'success',
    results: shelves.length,
    data: {
      shelves,
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
