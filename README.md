# encode-object

Encodes and decodes JS objects in Base62. Useful for maintaining state in a URL hash.
Right now, only works with positive integers and floats.

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

## Usage

```js
const config = {
  foo: ['int', 5],
  bar: ['int', 3],
  baz: ['int', 5],
  qux: ['int', 2],
  hoge: ['float', 2],
};

const obj = {
  foo: 25362,
  bar: 19,
  baz: 1000,
  qux: 40,
  hoge: 0.38,
};

const { encodeObject, decodeObject } = createEncoder(config);
encodeObject(obj); // returns 'ae40j0g86B40C0E'
decodeObject('ae40j0g86B40C0E'); // returns object with the same keys and values as `obj`
```

[![NPM](https://nodei.co/npm/encode-object.png)](https://www.npmjs.com/package/encode-object)

## License

MIT, see [LICENSE.md](http://github.com/rolyatmax/encode-object/blob/master/LICENSE.md) for details.
