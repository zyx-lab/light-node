const VeryAxios = require('./veryAxios');

const veryAxiosConfig = {
  cancelDuplicated: true,
};
const axiosConfig = {};

const request = new VeryAxios(veryAxiosConfig, axiosConfig);

module.exports = request;
