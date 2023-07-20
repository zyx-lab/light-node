const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  mode: {
    type: Number,
    enum: {
      values: [1, 2],
      message: 'Status is either: 1, 2', // 1表示按功能区分颜色，2表示按拣货员区分颜色
    },
  },
  inColor: {
    type: String,
  },
  outColor: {
    type: String,
  },
  checkColor: {
    type: String,
  },
});

const Config = mongoose.model('Config', configSchema);

module.exports = Config;
