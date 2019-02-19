const test = require('tape')
const proxyquire = require('proxyquire')

/**
 * Class for generating data structure emitted for a S3 "data" event
 */
class DataEvent {
  constructor (str) {
    this.Records = {
      Payload: Buffer.from(str)
    }
  }
}

/**
 * Stub for proxyquire
 */
class S3 {}

// Proxyquire the s3 library
const s3Select = proxyquire('../lib/s3', {
  'aws-sdk/clients/s3': S3
})

test('s3Select - should return expected json', async t => {
  t.plan(1)

  // Mock the data stream from S3
  const fixture = [
    { foo: 'bar' },
    { foo: 'baz' }
  ]
  const iteratorFixture = [
    Promise.resolve(new DataEvent(`${JSON.stringify(fixture[0])}\n`)),
    Promise.resolve(new DataEvent(`${JSON.stringify(fixture[1])}\n`)),
    Promise.resolve({ End: 'end' })
  ]
  const asyncIterable = {
    [Symbol.asyncIterator]: async function * asyncGenerator () {
      while (iteratorFixture.length) {
        yield await iteratorFixture.shift()
      }
    }
  }
  S3.prototype.selectObjectContent = (params) => {
    return {
      promise: async () => {
        return { Payload: asyncIterable }
      }
    }
  }

  try {
    const json = await s3Select()
    t.deepEquals(json, fixture, 'returns expected JSON')
  } catch (error) {
    t.notOk(error, 'unexpected error')
  }
})

test('s3Select - should return s3 callback 500 error', async t => {
  t.plan(2)

  // Mock the data stream from S3
  S3.prototype.selectObjectContent = (params) => {
    const error = new Error('Unknown bucket')
    error.code = 'NoBucket'
    throw error
  }

  try {
    await s3Select()
    t.fail('should have thrown error')
  } catch (error) {
    t.equals(error.message, 'Unknown bucket', 'expected error')
    t.equals(error.code, 500, 'expected error code')
  }
})

test('s3Select - should return s3 callback 400 error', async t => {
  t.plan(2)

  // Mock the data stream from S3
  S3.prototype.selectObjectContent = (params) => {
    const error = new Error()
    error.code = 'NoSuchKey'
    throw error
  }

  try {
    await s3Select()
    t.fail('should have thrown error')
  } catch (error) {
    t.equals(error.message, 'The requested file does not exist.', 'expected error')
    t.equals(error.code, 400, 'expected error code')
  }
})

test('s3Select - should emit encoding error', async t => {
  t.plan(2)

  // Mock the data stream from S3
  const asyncIterable = {
    [Symbol.asyncIterator]: async function * asyncGenerator () {
      const error = new Error()
      error.code = 'InvalidTextEncoding'
      throw error
    }
  }
  S3.prototype.selectObjectContent = (params) => {
    return {
      promise: async () => {
        return { Payload: asyncIterable }
      }
    }
  }

  try {
    await s3Select()
    t.fail('should have thrown error')
  } catch (error) {
    t.equals(error.message, ' The compression type set in input serialization may not match this file.', 'expected error')
    t.equals(error.code, 500, 'expected error code')
  }
})

test('s3Select - should return expected json', async t => {
  t.plan(1)

  // Mock the data stream from S3
  const asyncIterable = {
    [Symbol.asyncIterator]: async function * asyncGenerator () {
      const iteratorFixture = [
        Promise.resolve(new DataEvent('')),
        Promise.resolve({ End: 'end' })
      ]
      while (iteratorFixture.length) {
        yield await iteratorFixture.shift()
      }
    }
  }
  S3.prototype.selectObjectContent = (params) => {
    return {
      promise: async () => {
        return { Payload: asyncIterable }
      }
    }
  }

  try {
    await s3Select()
    t.fail('should not have returned')
  } catch (error) {
    t.ok(error, 'JSON parse error')
  }
})
