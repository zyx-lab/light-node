function format(num) {
  return num.toString(16).padStart(2, '0').toUpperCase();
}

function hexInt(total) {
  const a = Math.floor(total / 256);
  const b = total % 256;
  if (a > 255) {
    return hexInt(a) + format(b);
  }
  return format(a) + format(b);
}

function makeChecksum(hexdata) {
  if (!hexdata || hexdata === '') {
    return '00';
  }
  hexdata = hexdata.replace('0X', '');
  let total = 0;
  const len = hexdata.length;
  if (len % 2 !== 0) {
    return '00';
  }
  let num = 0;
  while (num < len) {
    const s = hexdata.substring(num, num + 2);
    total += parseInt(s, 16);
    num += 2;
  }
  return hexInt(total);
}

module.exports = { makeChecksum };
