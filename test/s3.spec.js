const test = require('tape')
const proxyquire = require('proxyquire')
const events = require('events').EventEmitter
const fixture = [
  { foo: 'bar' },
  { foo: 'baz' }
]

/**
 * Class for generating data structure emitted for a S3 "data" event
 */
class DataEvent {
  constructor(str) {
    this.Records = {
      Payload: Buffer.from(str)
    }
  }
}

/**
 * Stub for proxyquire
 */
class S3 {
  constructor(){}
}

// Proxyquire the s3 library
const s3Select = proxyquire('../lib/s3', {
  'aws-sdk/clients/s3' : S3
})

test('s3Select - should return expected json', async t => {
  t.plan(1)

  // Mock the data stream from S3
  S3.prototype.selectObjectContent = (params, callback) => {
    const emitter = new events.EventEmitter();

    callback(null, { Payload: emitter })

    emitter.emit('data', new DataEvent(`${JSON.stringify(fixture[0])}\n`))
    emitter.emit('data', new DataEvent(`${JSON.stringify(fixture[1])}\n`))
    emitter.emit('end')
  }

  try {
    const json = await s3Select()
    t.deepEquals(json, fixture, 'returns expected JSON')
  } catch (error) {
    t.notOk(error, 'unexpected error')
  }
})
