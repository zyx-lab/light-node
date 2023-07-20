const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    locationId: {
      type: String,
      required: [true, 'A location must have a location id'],
      unique: true,
    },
    lightId: {
      type: String,
      required: [true, 'A location must have a light id'],
      unique: true,
    },
    color: {
      type: String,
    },
    duration: {
      // ms
      type: Number,
    },
    status: {
      type: Number,
      enum: {
        values: [0, 1, 2],
        message: 'Status is either: 0, 1, 2',
      },
    },
    taskId: {
      type: String,
    },
    shelf: {
      type: mongoose.Schema.ObjectId,
      ref: 'Shelf',
      required: [true, 'A location must belong to a shelf.'],
    },
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
