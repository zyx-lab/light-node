const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Color must have a name'],
      unique: true,
    },
    inColor: {
      type: String,
      required: [true, 'A Color must have a inColor'],
    },
    outColor: {
      type: String,
      required: [true, 'A Color must have a outColor'],
    },
    checkColor: {
      type: String,
      required: [true, 'A Color must have a checkColor'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

colorSchema.virtual('users', {
  ref: 'User',
  foreignField: 'color',
  localField: '_id',
});

const Color = mongoose.model('Color', colorSchema);

module.exports = Color;
