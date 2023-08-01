const mongoose = require('mongoose');
const moment = require('moment');

const locationSchema = new mongoose.Schema(
  {
    locationId: {
      type: String,
      required: [true, 'A location must have a location id'],
      unique: true,
    },
    topic: {
      type: String,
      required: [true, 'A shelf must have a topic'],
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
    updateTime: {
      type: Date,
    },
    status: {
      type: Number,
      enum: {
        values: [0, 1, 2, 3],
        message: 'Status is either: 0, 1, 2, 3',
      },
    },
    errCode: {
      type: Number,
    },
    taskId: {
      type: String,
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

locationSchema.virtual('realStatus').get(function () {
  if (this.status === 0 || this.status === 3) {
    return this.status;
  }
  const currentTime = moment();
  const endTime = moment(this.updateTime).add(this.duration, 'millisecond');
  return currentTime.isBefore(endTime) ? this.status : 0;
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
