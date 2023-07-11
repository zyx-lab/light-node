const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  areaId: {
    type: String,
    required: [true, 'A area must have a area id'],
    unique: true,
  },
  lightId: {
    type: String,
    required: [true, 'A area must have a light id'],
    unique: true,
  },
  color: {
    type: String,
  },
  duration: {
    // ms
    type: String,
  },
  status: {
    type: Number,
    enum: {
      values: [0, 1, 2],
      message: 'Status is either: 0, 1, 2',
    },
  },
});

const Area = mongoose.model('Area', areaSchema);

module.exports = Area;
