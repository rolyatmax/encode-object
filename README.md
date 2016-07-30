# encode-object

Encodes and decodes JS objects in Base62. Useful for maintaining state in a URL hash.
Right now, only works with ints.

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

## Usage

`createEncoder` takes a config which maps each key it should find in an object to a `[max, min, step]`. `step` is optional and defaults to `1`.

```js
const config = {
  foo: [0, 5],
  bar: [10, 1000, 10],
  baz: [0, 1],
  qux: [-10, 10, 2],
};

const obj = {
  foo: 3,
  bar: 250,
  baz: 0,
  qux: -6,
};

const { encodeObject, decodeObject } = createEncoder(config);
encodeObject(obj); // returns '601BU'
decodeObject('601BU'); // returns object with the same keys and values as `obj`
```

[![NPM](https://nodei.co/npm/encode-object.png)](https://www.npmjs.com/package/encode-object)

## License

MIT, see [LICENSE.md](http://github.com/rolyatmax/encode-object/blob/master/LICENSE.md) for details.
