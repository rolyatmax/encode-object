# encode-object

Encodes and decodes JS objects in Base62. Useful for maintaining state in a URL hash.
Right now, only works with strings, positive integers, and positive floats.

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

## Usage

```js
const config = {
  foo: ['int', 5],
  bar: ['int', 3],
  baz: ['float', 2],
  qux: ['string', 5],
};

const obj = {
  foo: 25362,
  bar: 19,
  baz: 0.38,
  qux: 'moon',
};

const { encodeObject, decodeObject } = createEncoder(config);
encodeObject(obj); // returns '9b60j0C6B400Vqx'
decodeObject('9b60j0C6B400Vqx'); // returns object with the same keys and values as `obj`
```

[![NPM](https://nodei.co/npm/encode-object.png)](https://www.npmjs.com/package/encode-object)

## License

MIT, see [LICENSE.md](http://github.com/rolyatmax/encode-object/blob/master/LICENSE.md) for details.
