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
      validate: {
        validator: async function (value) {
          const count = await this.model('Shelf').countDocuments({
            lightId: value,
          });
          return count === 0;
        },
        message: 'Light id is already taken by a shelf',
      },
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
    taskType: {
      type: Number,
      enum: {
        values: [1, 2, 3],
        message: 'Task type is either: 1, 2, 3',
      },
    },
    shelf: {
      type: mongoose.Schema.ObjectId,
      ref: 'Shelf',
      required: [true, 'A location must belong to a shelf.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
