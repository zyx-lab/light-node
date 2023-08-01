const mongoose = require('mongoose');
const moment = require('moment');

const shelfSchema = new mongoose.Schema({
  shelfId: {
    type: String,
    required: [true, 'A shelf must have a shelf id'],
    unique: true,
  },
  topic: {
    type: String,
    required: [true, 'A shelf must have a topic'],
  },
  lightId: {
    type: String,
    required: [true, 'A shelf must have a light id'],
    unique: true,
    validate: {
      validator: async function (value) {
        const count = await this.model('Location').countDocuments({
          lightId: value,
        });
        return count === 0;
      },
      message: 'Light id is already taken by a location',
    },
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
      values: [0, 1, 2, 3],
      message: 'Status is either: 0, 1, 2, 3',
    },
  },
  errCode: {
    type: Number,
  },
});

shelfSchema.virtual('realStatus').get(function () {
  if (this.status === 0 || this.status === 3) {
    return this.status;
  }
  const currentTime = moment();
  const endTime = moment(this.time).add(this.duration, 'millisecond');
  return currentTime.isBefore(endTime) ? this.status : 0;
});

const Shelf = mongoose.model('Shelf', shelfSchema);

module.exports = Shelf;
