const _ = require('lodash')
const S3 = require('aws-sdk/clients/s3')
const s3 = new S3({ apiVersion: '2006-03-01' })

/**
 * select - select data from S3 using S3-select
 *
 * @param {object} params object to hold bucket name, key, input/output serialization etc.
 * @return {Array<Object>}      Array of objects as selected data from s3
 */
async function select (params) {

  return new Promise((resolve, reject) => {
    s3.selectObjectContent(params, (error, data) => {
      if (error) return handleError(error, reject)

      if (!data) return reject(new Error('No data recieved'))

      let buffer = Buffer.alloc(0)

      // data.Payload is a Readable Stream
      const eventStream = data.Payload

      // Read events as they are available
      eventStream.on('data', (event) => {
        // event.Records.Payload is a buffer containing a single record, partial records, or multiple records so concatenate buffers
        if (event.Records) buffer = Buffer.concat([buffer, event.Records.Payload])
      })

      // Handle errors encountered during the API call
      eventStream.on('error', (e) => {
        return handleError(e, reject)
      })

      eventStream.on('end', () => {
        // Convert buffer to string and then to JSON
        const jsonString = buffer.toString('utf8')
        try {
          const json = jsonString.replace(/\n$/, '').split('\n').map(JSON.parse)
          return resolve(json)
        } catch (error) {
          return reject(error)
        }
      })
    })
  })
}

/**
 * Format S3 errors for Koop handling
 * @param {object} error 
 * @param {function} reject 
 */
function handleError(error, reject) {
  // S3 errors have a "code" in the form of a string which cause trouble for Koop
  if (error.code === 'NoSuchKey') {
    error.code = 400
    error.message = 'The requested file does not exist.'
  } else if (error.code === 'InvalidTextEncoding') {
    error.code = 500
    error.message = `${error.message} The compression type set in input serialization may not match this file.`
  } else if (typeof error.code === 'string') error.code = 500

  return reject(error)
}

module.exports = select
