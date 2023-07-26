const { encode } = require('hex-encode-decode');
const mqttClient = require('./index');
const conversion = require('../utils/conversion');

const { makeChecksum } = conversion;

function updateLightInfo(quantity, duration, color, status, lightIdList) {
  try {
    if (quantity === lightIdList.length) {
      const len = 8 + 2 * quantity;
      const sLen = len.toString(16).padStart(4, '0');
      const sQuantity = quantity.toString(16).padStart(4, '0');
      const sTime = duration.toString(16).padStart(4, '0');
      const sStatus = status.toString(16).padStart(2, '0');
      let sLightId = '';
      lightIdList.forEach((lightId) => {
        sLightId += parseInt(lightId, 10).toString(16).padStart(4, '0');
      });
      const s = `0121${sLen}${sQuantity}${sTime}${color}${sStatus}${sLightId}`;
      const Bcc = makeChecksum(s);
      const bytes = encode(`${s}${Bcc}`, 'hex');
      mqttClient.publish('/light/node9', bytes, { qos: 2 }, (error) => {
        if (error) {
          console.error(error);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = { updateLightInfo };
