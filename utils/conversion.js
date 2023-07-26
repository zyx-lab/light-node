function Solution(a, b) {
  let ans = '';
  let ca = 0;
  for (let i = a.length - 1, j = b.length - 1; i >= 0 || j >= 0; i--, j--) {
    let sum = ca;
    sum += i >= 0 ? parseInt(a.charAt(i)) : 0;
    sum += j >= 0 ? parseInt(b.charAt(j)) : 0;
    ans += sum % 2;
    ca = Math.floor(sum / 2);
  }
  ans += ca === 1 ? ca : '';
  return ans.split('').reverse().join('');
}

function toggleBits(s) {
  const i = parseInt(s, 2);
  const i2 = i ^ ((1 << s.length) - 1);
  let s2 = i2.toString(2);
  while (s2.length < s.length) {
    s2 = `0${s2}`;
  }
  const solution = Solution(s2, '1');
  let s1 = parseInt(solution, 2).toString(16);
  if (s1.length >= 3) {
    s1 = s1.substring(s1.length - 2, s1.length).toUpperCase();
  }
  return s1;
}

function sixteenToBinaryString(hex) {
  let s2 = '';
  const l = parseInt(hex, 16);
  s2 = l.toString(2);
  const num = 8;
  while (s2.length < num) {
    s2 = `0${s2}`;
  }
  return toggleBits(s2);
}

function format(hex) {
  let hexa = hex.toString(16);
  const len = hexa.length;
  if (len < 2) {
    hexa = `0${hexa}`;
  }
  return hexa;
}

function hexInt(total) {
  const a = Math.floor(total / 256);
  const b = total % 256;
  if (a > 255) {
    return hexInt(a) + format(b);
  }
  return sixteenToBinaryString(format(a) + format(b));
}

function makeChecksum(hexdata) {
  if (hexdata == null || hexdata === '') {
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
