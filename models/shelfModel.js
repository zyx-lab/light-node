const mongoose = require('mongoose');

const shelfSchema = new mongoose.Schema({
  shelfId: {
    type: String,
    required: [true, 'A shelf must have a shelf id'],
    unique: true,
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
      message: 'Status is either: 0, 1, 3',
    },
  },
  errCode: {
    type: String,
  },
});

const Shelf = mongoose.model('Shelf', shelfSchema);

module.exports = Shelf;
