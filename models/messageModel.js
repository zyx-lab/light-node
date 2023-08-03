const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  seq: {
    type: Number,
    required: [true, 'A message must have a seq'],
    unique: true,
  },
  type: {
    type: Number,
    required: [true, 'A message must have a type'],
    enum: {
      values: [0, 1, 2],
      message: 'Type is either: 0, 1, 2',
    },
  },
  taskId: {
    type: String,
  },
  lightIds: {
    type: [String],
    required: [true, 'A message must have a lightIds'],
  },
  color: {
    type: String,
  },
  duration: {
    type: Number,
  },
  status: {
    type: Number,
    required: [true, 'A message must have a duration'],
    enum: {
      values: [0, 1],
      message: 'Status is either: 0, 1',
    },
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
