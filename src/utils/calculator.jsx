// calculate middle of an array. -> return float(digit).
const calcMiddle = (array, digit) => {
  const len = array.length;
  let middle = 0;
  array.sort((a, b) => a - b);
  if (len % 2 === 0) {
    middle = parseFloat(array[len / 2] + array[len / 2 - 1]) / 2;
  } else {
    middle = parseFloat(array[parseInt(len / 2, 10)]);
  }
  return middle.toFixed(digit);
};

// divide array according middle. -> return [array, array, hmin, hmax, lmin, lmax].
const divideMiddle = (array, middle) => {
  const highmiddle = array.filter((m) => m - middle > 0);
  const lowmiddle = array.filter((m) => m - middle <= 0);

  const hmin = Math.min(...highmiddle);
  const hmax = Math.max(...highmiddle);

  const lmin = Math.min(...lowmiddle);
  const lmax = Math.max(...lowmiddle);

  return [highmiddle, lowmiddle, hmin, hmax, lmin, lmax];
};

// normalize data
const normalizeData = (data, min, max, digit) => {
  const d = (parseFloat(data) - min) / (max - min);
  return d.toFixed(digit);
};

function gradientPos(data, finalMiddle, hmin, hmax, lmin, lmax, rbh, rbl) {
  let colorhex = '';
  if (data - finalMiddle > 0) {
    const pos = normalizeData(data, hmin, hmax, 2);
    colorhex = rbh.rgbAt(pos).toHexString();
  } else {
    const pos = normalizeData(data, lmin, lmax, 2);
    colorhex = rbl.rgbAt(pos).toHexString();
  }
  return colorhex;
}

export { calcMiddle, divideMiddle, normalizeData, gradientPos };
