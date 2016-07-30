import hashObject from 'object-hash';
import leftPad from 'left-pad';
import { toBase62, fromBase62, toBase2, fromBase2 } from 'bases';


const VERSION_LENGTH = 2;
const alphabetize = (a, b) => (a < b ? -1 : 1);

function validateConfig(config) {
  Object.keys(config).forEach((key) => {
    const [min, max, step] = config[key];
    if (min > max) throw new RangeError(`min is greater than max for field: "${key}"`);
    if ((max - min) % step !== 0) {
      throw new RangeError(
        `the range between min and max must be divisible by step ${step} for field: ${key}`
      );
    }
  });
}

export default function createEncoder(config) {
  if (!config) throw new Error('config required');

  const configKeys = Object.keys(config);
  configKeys.sort(alphabetize);

  let totalBitsNeeded = 0;

  // fill in defaults
  config = { ...config };
  configKeys.forEach((key) => {
    const [min, max, step = 1] = config[key];
    if (step === 0) throw new RangeError(`step cannot be 0 for field: ${key}`);
    const steps = ((max - min) / step) + 1; // plus one because range is inclusive
    const bitsNeeded = Math.ceil(Math.log2(steps));
    totalBitsNeeded += bitsNeeded;
    config[key] = [min, max, step, bitsNeeded];
  });

  validateConfig(config);

  const configVersion = hashObject(config).slice(0, VERSION_LENGTH);

  function validateObject(obj) {
    const objKeys = Object.keys(obj);
    const missingConfigKeys = objKeys.filter(key => !configKeys.includes(key));
    const missingObjKeys = configKeys.filter(key => !objKeys.includes(key));
    if (missingConfigKeys.length) {
      throw new Error(`config is missing fields: ${missingConfigKeys.join(', ')}`);
    }
    if (missingObjKeys.length) {
      throw new Error(`object is missing config fields: ${missingObjKeys.join(', ')}`);
    }

    configKeys.forEach((key) => {
      const [min, max, step] = config[key];
      const val = obj[key];

      if (!Number.isFinite(val)) {
        throw new TypeError('all object values must be numbers');
      }

      if (val > max) {
        throw new RangeError(`value ${val} is greater than ${max} for field "${key}"`);
      }

      if (val < min) {
        throw new RangeError(`value ${val} is less than ${min} for field "${key}"`);
      }

      if ((val - min) % step !== 0) {
        throw new RangeError(
          `value ${val} cannot be reached from minimum ${min} by step ${step} for field "${key}"`
        );
      }
    });
  }

  function validateHash(hash) {
    const version = hash.slice(0, VERSION_LENGTH);
    if (version !== configVersion) {
      throw new Error('hash was encoded with different config version');
    }
  }

  function encodeObject(obj) {
    validateObject(obj);
    const bits = configKeys.map((key) => {
      const [min, , step, bitsNeeded] = config[key];
      const val = obj[key];
      // NOTE: rounding here because of floating point errors?
      const valInBase2 = toBase2(Math.round((val - min) / step));
      return leftPad(valInBase2, bitsNeeded, '0');
    }).join('');
    return configVersion + toBase62(fromBase2(bits));
  }

  function decodeObject(hash) {
    const obj = {};
    validateHash(hash);
    hash = hash.slice(VERSION_LENGTH);
    let bits = toBase2(fromBase62(hash));
    bits = leftPad(bits, totalBitsNeeded, '0');
    configKeys.forEach((key) => {
      const [min, , step, bitsNeeded] = config[key];
      const bit = bits.slice(0, bitsNeeded);
      const val = fromBase2(bit);
      obj[key] = (val * step) + min;
      bits = bits.slice(bitsNeeded);
    });
    return obj;
  }

  return { decodeObject, encodeObject };
}
