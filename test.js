import test from 'tape'; // eslint-disable-line
import createEncoder from './lib/encode-object';


// TODO: tests to write:
// * should work with custom encoder/decoder
// * should work with predefined string lists

test('createEncoder should throw if no config is supplied', (t) => {
  t.throws(() => createEncoder());
  t.end();
});

test('encodeObject should throw if config includes fields not in obj', (t) => {
  const { encodeObject } = createEncoder({
    a: ['int', 3],
    b: ['int', 3],
  });
  t.throws(() => encodeObject({ a: 362 }));
  t.end();
});

test('encodeObject should throw if obj includes fields not in config', (t) => {
  const { encodeObject } = createEncoder({ a: ['int', 3] });
  t.throws(() => encodeObject({
    a: 123,
    b: 456,
  }));
  t.end();
});

test('encodeObject should throw for invalid values', (t) => {
  const { encodeObject } = createEncoder({ a: ['int', 3] });
  t.throws(() => encodeObject({ a: [] }));
  t.throws(() => encodeObject({ a: {} }));
  t.throws(() => encodeObject({ a: true }));
  t.throws(() => encodeObject({ a: Infinity }));
  t.throws(() => encodeObject({ a: NaN }));
  t.end();
});

test('encodeObject should throw for negative int values', (t) => {
  const { encodeObject } = createEncoder({ a: ['int', 3] });
  t.throws(() => encodeObject({ a: -123 }));
  t.end();
});

test('encodeObject should throw for negative float values', (t) => {
  const { encodeObject } = createEncoder({ a: ['float', 3] });
  t.throws(() => encodeObject({ a: -0.123 }));
  t.end();
});

test('encodeObject should throw for float values greater than 1.0', (t) => {
  const { encodeObject } = createEncoder({ a: ['float', 3] });
  t.throws(() => encodeObject({ a: 1.23 }));
  t.end();
});

test('encodeObject should throw for int values greater than max length', (t) => {
  const { encodeObject } = createEncoder({ a: ['int', 3] });
  t.throws(() => encodeObject({ a: 1234 }));
  t.end();
});

test('decodeObject should throw for hashes encoded with different config', (t) => {
  const encoder1 = createEncoder({ a: ['int', 3] });
  const encoder2 = createEncoder({ a: ['int', 4] });
  const encoded = encoder1.encodeObject({ a: 123 });
  t.throws(() => encoder2.decodeObject(encoded));
  t.end();
});

test('decodeObject should correctly decode for hashes encoded with equivalent config', (t) => {
  const encoder1 = createEncoder({ a: ['int', 3] });
  const encoder2 = createEncoder({ a: ['int', 3] });
  const testObj = { a: 123 };
  const encoded = encoder1.encodeObject(testObj);
  const decoded = encoder2.decodeObject(encoded);
  t.deepEqual(testObj, decoded);
  t.end();
});

test('encoder should encode/decode ints', (t) => {
  const { encodeObject, decodeObject } = createEncoder({
    a: ['int', 5],
    b: ['int', 3],
  });
  const testObj = { a: 25362, b: 12 };
  const encoded = encodeObject(testObj);
  const decoded = decodeObject(encoded);
  t.deepEqual(testObj, decoded);
  t.end();
});

test('encoder should encode/decode floats', (t) => {
  const { encodeObject, decodeObject } = createEncoder({
    a: ['float', 4],
    b: ['float', 8],
  });
  const testObj = { a: 0.123, b: 0.12345678 };
  const encoded = encodeObject(testObj);
  const decoded = decodeObject(encoded);
  t.deepEqual(testObj, decoded);
  t.end();
});

test('encoder should encode/decode strings', (t) => {
  const { encodeObject, decodeObject } = createEncoder({
    a: ['string', 4],
  });
  const testObj = { a: 'moon' };
  const encoded = encodeObject(testObj);
  const decoded = decodeObject(encoded);
  t.deepEqual(testObj, decoded);
  t.end();
});

// test('encoder should encode/decode strings from config\'s string list', (t) => {
//   const { encodeObject, decodeObject } = createEncoder({
//     a: ['string', ['foo', 'bar', 'baz', 'qux']],
//   });
//   const testObj = { a: 'bar' };
//   const encoded = encodeObject(testObj);
//   const decoded = decodeObject(encoded);
//   t.deepEqual(testObj, decoded);
//   t.end();
// });

test('encoder should decode to the same object that was encoded', (t) => {
  const { encodeObject, decodeObject } = createEncoder({
    a: ['int', 5],
    b: ['int', 3],
    c: ['float', 2],
    d: ['string', 5],
  });
  const testObj = {
    a: 25362,
    b: 19,
    c: 0.43,
    d: 'moon',
  };
  const encoded = encodeObject(testObj);
  const decoded = decodeObject(encoded);
  t.deepEqual(testObj, decoded);
  t.end();
});
