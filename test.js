import test from 'tape'; // eslint-disable-line
import createEncoder from './lib/encode-object';

const testObj = {
  a: 25362,
  b: 19,
  c: 1000,
  d: 40,
  e: 0.38,
};

const testConfig = {
  a: ['int', 5],
  b: ['int', 3],
  c: ['int', 5],
  d: ['int', 2],
  e: ['float', 2],
};

test('encoder should decode to the same object that was encoded', (t) => {
  const { encodeObject, decodeObject } = createEncoder(testConfig);
  const encoded = encodeObject(testObj);
  const decoded = decodeObject(encoded);
  t.deepEqual(testObj, decoded);
  t.end();
});
