const { decode } = require('hex-encode-decode');
const conversion = require('../utils/conversion');
const Location = require('../models/locationModel');
const Shelf = require('../models/shelfModel');

const { makeChecksum } = conversion;

function checkPayloadBcc(payload) {
  let flag = false;
  const bccCode = payload.slice(-2);
  const prepareBCC = payload.slice(0, payload.length - 2);
  if (bccCode === makeChecksum(prepareBCC)) {
    flag = true;
  }
  return flag;
}

async function lightError(payload) {
  try {
    const len = parseInt(payload.slice(4, 8), 16);
    const quantity = parseInt(payload.slice(10, 14), 16);
    if (len !== 3 + 2 * quantity) return;

    const err = payload.slice(8, 10);
    const lightId = payload.slice(14, 14 + quantity * 4);
    const lightIdList = [];

    if (lightId.length % 4 === 0) {
      let i = 0;
      while (i < quantity * 4) {
        const id = lightId.slice(i, i + 4);
        const parsedId = id ? parseInt(id, 16).toString() : null;
        if (parsedId) lightIdList.push(parsedId);
        i += 4;
      }
    }

    if (lightIdList.length) {
      await Location.updateMany(
        { lightId: { $in: lightIdList } },
        { status: 3, errCode: err },
        { runValidators: true }
      );
      await Shelf.updateMany(
        { lightId: { $in: lightIdList } },
        { status: 3, errCode: err },
        { runValidators: true }
      );
    }
  } catch (err) {
    console.error(err);
  }
}

const lightClose = async (payload) => {
  try {
    const len = parseInt(payload.slice(4, 8), 16);
    const quantity = parseInt(payload.slice(10, 14), 16);
    if (len !== 3 + 2 * quantity) return;
    const lightId = payload.slice(14, 14 + quantity * 4);
    const lightIdList = [];

    if (lightId.length % 4 === 0) {
      let i = 0;
      while (i < quantity * 4) {
        const id = lightId.slice(i, i + 4);
        const parsedId = id ? parseInt(id, 16).toString() : null;
        if (parsedId) lightIdList.push(parsedId);
        i += 4;
      }

      const locations = await Location.find({
        lightId: { $in: [3, 4] },
      }).select('locationId');
      const locationId = locations.map((item) => item.locationId);
    }
  } catch (err) {
    console.error(err);
  }
};

function receivingMessage(topic, payload) {
  try {
    const payloadHex = decode(payload.toString());
    const checkBCC = checkPayloadBcc(payloadHex);
    if (checkBCC) {
      const command = payloadHex.slice(2, 4);
      if (command === '22') lightError(payloadHex);
      if (command === '23') lightClose(payloadHex);
    }
  } catch (err) {
    console.error(err);
  }
}
module.exports = { receivingMessage };
