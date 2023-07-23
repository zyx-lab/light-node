const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'A user must have a user id'],
    unique: true,
  },
  logInTime: {
    type: Date,
    default: Date.now(),
  },
  color: {
    type: mongoose.Schema.ObjectId,
    ref: 'Color',
    required: [true, 'A user must belong to a color.'],
  },
});

const Config = mongoose.model('User', userSchema);

module.exports = Config;
