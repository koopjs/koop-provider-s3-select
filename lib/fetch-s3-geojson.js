const config = require('config')
const bucket = config.koopProviderS3 && config.koopProviderS3.bucket
const s3 = require('./s3')
const { translate } = require('./translate')

/**
 *
 * @param {string} sql
 * @param {string} key
 * @param {object} inputSerialization
 * @param {object} options
 */
async function fetchS3Geojson (sql, key, inputSerialization, options = {}) {
  // Setup S3 parameters

  const params = {
    Bucket: options.bucket || bucket,
    Key: key,
    Expression: sql,
    ExpressionType: 'SQL',
    InputSerialization: inputSerialization,
    OutputSerialization: {
      JSON: {}
    }
  }
  // Use S3 Select to get data from a S3 file
  const json = await s3.select(params, options)
  return translate(json)
}

module.exports = fetchS3Geojson
