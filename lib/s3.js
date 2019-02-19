const S3 = require('aws-sdk/clients/s3')
const s3 = new S3({ apiVersion: '2006-03-01' })
const Logger = require('@koopjs/logger')
const config = require('config')
const log = new Logger(config)

/**
 * select - select data from S3 using S3-select
 *
 * @param {object} params object to hold bucket name, key, input/output serialization etc.
 * @return {Array<Object>}      Array of objects as selected data from s3
 */
async function select (params) {
  // TODO: convert function to a generator that yields a feature at a time
  try {
    const data = await s3.selectObjectContent(params).promise()
    if (!data) throw new Error('No data recieved')

    const events = data.Payload
    let buffer = Buffer.alloc(0)

    for await (const event of events) {
      // Check the top-level field to determine which event this is
      if (event.Records) {
        if (!event.Records.Payload) return log.warn('Missing event.Records.Payload.')
        buffer = Buffer.concat([buffer, event.Records.Payload])
      } else if (event.Stats) {
        // handle Stats event
        log.info(event.Stats) // TODO: special handling for Stats
      } else if (event.Progress) {
        // handle Progress event
        log.info(event.Progress) // TODO: special handling for Progress
      } else if (event.Cont) {
        // handle Cont event
        log.info(event.Cont) // TODO: special handling for Cont
      } else if (event.End) {
        // Convert completed buffer to string
        const jsonString = buffer.toString('utf8')
        // Remove terminating \n, then split into array and parse
        return jsonString.replace(/\n$/, '').split('\n').map(JSON.parse)
      } else throw new Error(`Unexpected S3 event: ${JSON.stringify(event)}`)
    }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Format S3 errors for Koop handling
 * @param {object} error
 * @param {function} reject
 */
function handleError (error, reject) {
  // S3 errors have a "code" in the form of a string which cause trouble for Koop
  if (error.code === 'NoSuchKey') {
    error.code = 400
    error.message = 'The requested file does not exist.'
  } else if (error.code === 'InvalidTextEncoding') {
    error.code = 500
    error.message = `${error.message} The compression type set in input serialization may not match this file.`
  } else if (typeof error.code === 'string') error.code = 500

  throw error
}

module.exports = select
