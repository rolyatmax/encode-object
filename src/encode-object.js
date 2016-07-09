import hashObject from 'object-hash';
import { toBase62, fromBase62, toAlphabet, fromAlphabet } from 'bases';


const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const VERSION_LENGTH = 3;

function leftPad(str, len, char = ' ') {
  str = `${str}`;
  len = len - str.length;
  if (len <= 0) return str;
  return char.repeat(len) + str;
}

function getMaxEncodedLen(type, len, encode) {
  if (type === 'string') {
    const lastLetter = ALPHABET[ALPHABET.length - 1];
    const maxBase10Val = fromAlphabet(lastLetter.repeat(len), ALPHABET);
    len = maxBase10Val.length;
  }
  const max = Math.pow(10, len) - 1;
  return encode(max).length;
}

function alphabetize(a, b) {
  return a < b ? -1 : 1;
}

function floatToInt(val, decimals) {
  return (val * Math.pow(10, decimals)) | 0;
}

function intToFloat(val, decimals) {
  return val / Math.pow(10, decimals);
}

export default function createEncoder(config, encode = toBase62, decode = fromBase62) {
  if (!config) {
    throw new Error('config required');
  }

  const keys = Object.keys(config);
  keys.sort(alphabetize);

  const configVersion = hashObject(config).slice(0, VERSION_LENGTH);

  function validateObject(obj) {
    keys.forEach((key) => {
      const [type, maxLen] = config[key];
      const val = obj[key];
      // for now, make sure everything's a number
      if (!Number.isFinite(val)) throw new Error('all object values must be numbers');
      if (Number.isFinite(val) && val < 0) throw new Error('all numbers must be positive');

      if (type === 'float') {
        if (val >= 1) throw new Error('floats must be less than 1.0');
      } else {
        const valLen = (`${val}`).length;
        if (valLen > maxLen) throw new Error(`value exceeds max length for field: ${key}`);
      }
    });
  }

  function validateHash(hash) {
    const version = hash.slice(0, VERSION_LENGTH);
    if (version !== configVersion) {
      throw new Error('hash was encrypted with different config version');
    }
  }

  function encodeObject(obj) {
    validateObject(obj);
    const bits = keys.map((key) => {
      const [type, maxLen] = config[key];
      const maxEncodedLen = getMaxEncodedLen(type, maxLen, encode);
      let val = obj[key];
      if (type === 'float') val = floatToInt(val, maxLen);
      if (type === 'string') val = fromAlphabet(val, ALPHABET);
      return leftPad(encode(val), maxEncodedLen, '0');
    });
    bits.unshift(configVersion);
    return bits.join('');
  }

  function decodeObject(hash) {
    const obj = {};
    validateHash(hash);
    hash = hash.slice(VERSION_LENGTH);
    keys.forEach((key) => {
      const [type, maxLen] = config[key];
      const maxEncodedLen = getMaxEncodedLen(type, maxLen, encode);
      const bit = hash.slice(0, maxEncodedLen);
      let val = decode(bit);
      if (type === 'float') val = intToFloat(val, maxLen);
      if (type === 'string') val = toAlphabet(val, ALPHABET);
      obj[key] = val;
      hash = hash.slice(maxEncodedLen);
    });
    return obj;
  }

  return { decodeObject, encodeObject };
}
