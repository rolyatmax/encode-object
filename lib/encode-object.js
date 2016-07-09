'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = createEncoder;

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var _leftPad = require('left-pad');

var _leftPad2 = _interopRequireDefault(_leftPad);

var _bases = require('bases');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
var VERSION_LENGTH = 3;

var alphabetize = function alphabetize(a, b) {
  return a < b ? -1 : 1;
};
var floatToInt = function floatToInt(val, decimals) {
  return val * Math.pow(10, decimals) | 0;
};
var intToFloat = function intToFloat(val, decimals) {
  return val / Math.pow(10, decimals);
};

function getMaxEncodedLen(type, len, encode) {
  if (type === 'string') {
    var lastLetter = ALPHABET[ALPHABET.length - 1];
    var maxBase10Val = (0, _bases.fromAlphabet)(lastLetter.repeat(len), ALPHABET);
    len = ('' + maxBase10Val).length;
  }
  var max = Math.pow(10, len) - 1;
  return encode(max).length;
}

function createEncoder(config) {
  var encode = arguments.length <= 1 || arguments[1] === undefined ? _bases.toBase62 : arguments[1];
  var decode = arguments.length <= 2 || arguments[2] === undefined ? _bases.fromBase62 : arguments[2];

  if (!config) throw new Error('config required');

  var configKeys = Object.keys(config);
  configKeys.sort(alphabetize);

  var configVersion = (0, _objectHash2.default)(config).slice(0, VERSION_LENGTH);

  function validateObject(obj) {
    var objKeys = Object.keys(obj);
    var missingConfigKeys = objKeys.filter(function (key) {
      return !configKeys.includes(key);
    });
    var missingObjKeys = configKeys.filter(function (key) {
      return !objKeys.includes(key);
    });
    if (missingConfigKeys.length) {
      throw new Error('config is missing fields: ' + missingConfigKeys.join(', '));
    }
    if (missingObjKeys.length) {
      throw new Error('object is missing config fields: ' + missingObjKeys.join(', '));
    }

    configKeys.forEach(function (key) {
      var _config$key = _slicedToArray(config[key], 2);

      var type = _config$key[0];
      var maxLen = _config$key[1];

      var val = obj[key];

      if (!Number.isFinite(val) && typeof val !== 'string') {
        throw new Error('all object values must be numbers or strings');
      }
      if (Number.isFinite(val) && val < 0) {
        throw new Error('all numbers must be positive');
      }

      if (type === 'float') {
        if (val >= 1) throw new Error('floats must be less than 1.0');
      } else {
        var valLen = ('' + val).length;
        if (valLen > maxLen) throw new Error('value exceeds max length for field: ' + key);
      }
    });
  }

  function validateHash(hash) {
    var version = hash.slice(0, VERSION_LENGTH);
    if (version !== configVersion) {
      throw new Error('hash was encoded with different config version');
    }
  }

  function encodeObject(obj) {
    validateObject(obj);
    var bits = configKeys.map(function (key) {
      var _config$key2 = _slicedToArray(config[key], 2);

      var type = _config$key2[0];
      var maxLen = _config$key2[1];

      var maxEncodedLen = getMaxEncodedLen(type, maxLen, encode);
      var val = obj[key];
      if (type === 'float') val = floatToInt(val, maxLen);
      if (type === 'string') val = (0, _bases.fromAlphabet)(val, ALPHABET);
      return (0, _leftPad2.default)(encode(val), maxEncodedLen, '0');
    });
    bits.unshift(configVersion);
    return bits.join('');
  }

  function decodeObject(hash) {
    var obj = {};
    validateHash(hash);
    hash = hash.slice(VERSION_LENGTH);
    configKeys.forEach(function (key) {
      var _config$key3 = _slicedToArray(config[key], 2);

      var type = _config$key3[0];
      var maxLen = _config$key3[1];

      var maxEncodedLen = getMaxEncodedLen(type, maxLen, encode);
      var bit = hash.slice(0, maxEncodedLen);
      var val = decode(bit);
      if (type === 'float') val = intToFloat(val, maxLen);
      if (type === 'string') val = (0, _bases.toAlphabet)(val, ALPHABET);
      obj[key] = val;
      hash = hash.slice(maxEncodedLen);
    });
    return obj;
  }

  return { decodeObject: decodeObject, encodeObject: encodeObject };
}