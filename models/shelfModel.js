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
      message: 'Status is either: 0, 1, 3',
    },
  },
});

const Shelf = mongoose.model('Shelf', shelfSchema);

module.exports = Shelf;
