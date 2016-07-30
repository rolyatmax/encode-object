import test from 'tape'; // eslint-disable-line
import createEncoder from './lib/encode-object';


test('createEncoder should throw if no config is supplied', (t) => {
  t.throws(() => createEncoder());
  t.end();
});

test('encodeObject should throw if config includes fields not in obj', (t) => {
  const { encodeObject } = createEncoder({
    a: [0, 500],
    b: [0, 10],
  });
  t.throws(() => encodeObject({ a: 362 }));
  t.end();
});

test('encodeObject should throw if obj includes fields not in config', (t) => {
  const { encodeObject } = createEncoder({ a: [0, 200] });
  t.throws(() => encodeObject({
    a: 123,
    b: 456,
  }));
  t.end();
});

test('encodeObject should throw for invalid values', (t) => {
  const { encodeObject } = createEncoder({ a: [0, 10] });
  t.throws(() => encodeObject({ a: [] }));
  t.throws(() => encodeObject({ a: {} }));
  t.throws(() => encodeObject({ a: true }));
  t.throws(() => encodeObject({ a: Infinity }));
  t.throws(() => encodeObject({ a: NaN }));
  t.end();
});

test('encodeObject should throw for values greater than max', (t) => {
  const { encodeObject } = createEncoder({ a: [100, 200] });
  t.throws(() => encodeObject({ a: 201 }));
  t.end();
});

test('encodeObject should throw for values less than min', (t) => {
  const { encodeObject } = createEncoder({ a: [100, 200] });
  t.throws(() => encodeObject({ a: 99 }));
  t.end();
});

test('encodeObject should throw for values unreachable by step', (t) => {
  const { encodeObject } = createEncoder({ a: [0, 10, 2] });
  t.throws(() => encodeObject({ a: 3 }));
  t.end();
});

test('decodeObject should throw for hashes encoded with different config', (t) => {
  const encoder1 = createEncoder({ a: [0, 10] });
  const encoder2 = createEncoder({ a: [10, 20] });
  const encoded = encoder1.encodeObject({ a: 8 });
  t.throws(() => encoder2.decodeObject(encoded));
  t.end();
});

test('decodeObject should correctly decode for hashes encoded with equivalent config', (t) => {
  const encoder1 = createEncoder({ a: [10, 20] });
  const encoder2 = createEncoder({ a: [10, 20] });
  const testObj = { a: 15 };
  const encoded = encoder1.encodeObject(testObj);
  const decoded = encoder2.decodeObject(encoded);
  t.deepEqual(testObj, decoded);
  t.end();
});

test('encoder should decode to the same object that was encoded', (t) => {
  const { encodeObject, decodeObject } = createEncoder({
    a: [0, 100],
    b: [10, 20, 2],
    c: [0, 1],
    d: [-1000, 1000, 1],
    e: [0, 1, 0.25], // floats not officially supported
    f: [-100, 100, 0.5], // floats not officially supported
    g: [0.5, 1, 0.25], // floats not officially supported
    h: [0, 123456, 24],
  });
  const testObj = {
    a: 55,
    b: 12,
    c: 1,
    d: -98,
    e: 0.25, // floats not officially supported
    f: -23.5, // floats not officially supported
    g: 0.75, // floats not officially supported
    h: 696,
  };
  const encoded = encodeObject(testObj);
  const decoded = decodeObject(encoded);
  t.deepEqual(testObj, decoded);
  t.end();
});
