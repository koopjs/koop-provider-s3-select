const S3 = require('aws-sdk/clients/s3')
const s3 = new S3({ apiVersion: '2006-03-01' })

/**
 * select - select data from S3 using S3-select
 *
 * @param {object} params object to hold bucket name, key, input/output serialization etc.
 * @param {object} options
 * @return {Array<Object>}      Array of objects as selected data from s3
 */
async function select (params, options = {}) {
  let buffer = Buffer.alloc(0)

  return new Promise((resolve, reject) => {
    s3.selectObjectContent(params, (err, data) => {
      if (err) {
        return reject(err)
      }

      if (!data) {
        return reject(new Error('No data recieved'))
      }

      // data.Payload is a Readable Stream
      const eventStream = data.Payload

      // Read events as they are available
      eventStream.on('data', (event) => {
        // event.Records.Payload is a buffer containing a single record, partial records, or multiple records so concatenate buffers
        if (event.Records) buffer = Buffer.concat([buffer, event.Records.Payload])
      })

      // Handle errors encountered during the API call
      eventStream.on('error', (e) => {
        return reject(e)
      })

      eventStream.on('end', () => {
        // Convert buffer to string and then to JSON
        const json = s3StringToJson(buffer.toString('utf8'))

        // S3 can sometime append an empty line to end of file stream;
        // Empty strings were converted to "undefined", so check last element and remove if found
        if (json[json.length - 1] === undefined) json.pop()
        return resolve(json)
      })
    })
  })
}

/**
 * stringToJson - convert string to Json for a collection of records
 *
 * @param  {String} str string containing multiple records
 * @return {Array<Object>} data as array of objects
 */
function s3StringToJson (str) {
  return str.split('\n')
    .map(rec => {
      try {
        return JSON.parse(rec)
      } catch (e) {
        // Last array element is often an empty string; return undefined and remove it later

      }
    })
}

module.exports = {
  select,
  s3StringToJson
}
