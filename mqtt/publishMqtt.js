const conversion = require('../utils/conversion');

const { makeChecksum } = conversion;

// ('/andon/50547b4919599');
function updateLightInfo(seq, quantity, duration, color, status, lightIdList) {
  try {
    if (quantity === lightIdList.length) {
      const len = 8 + 2 * quantity;
      const sSeq = seq.toString(16).padStart(4, '0');
      const sLen = len.toString(16).padStart(4, '0');
      const sQuantity = quantity.toString(16).padStart(4, '0');
      const sTime = duration.toString(16).padStart(4, '0');
      const sStatus = status.toString(16).padStart(2, '0');
      let sLightId = '';
      lightIdList.forEach((lightId) => {
        sLightId += parseInt(lightId, 10).toString(16).padStart(4, '0');
      });
      const s = `${sSeq}21${sLen}${sQuantity}${sTime}${color}${sStatus}${sLightId}`;
      const Bcc = makeChecksum(s);
      const bytes = Buffer.from(`${s}${Bcc}`, 'hex');
      return bytes;
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = { updateLightInfo };
