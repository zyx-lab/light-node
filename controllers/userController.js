const Color = require('../models/colorModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const colors = await Color.aggregate([
    {
      $lookup: {
        from: 'users',
        let: { colorId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $ne: ['$userId', userId] },
                  { $eq: ['$color', '$$colorId'] },
                ],
              },
            },
          },
        ],
        localField: '_id',
        foreignField: 'color',
        as: 'users',
      },
    },
    {
      $project: {
        _id: 1,
        userCount: { $size: '$users' },
      },
    },
    {
      $sort: { userCount: 1 },
    },
  ]);

  if (colors.length === 0) {
    return next(new AppError('No color found', 404));
  }
  const colorId = colors[0]._id;
  const newUser = await User.findOneAndUpdate(
    { userId },
    {
      userId,
      color: colorId,
      logInTime: Date.now(),
    },
    { upsert: true, new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      newUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findOneAndDelete({ userId: userId });
  if (!user) {
    return next(new AppError('Invalid userId', 404));
  }
  res.status(204).end();
});
