const fetchS3GeoJson = require('./lib/fetch-s3-geojson')
const config = require('config')
if (!config.koopProviderS3) throw new Error(`ERROR: "koopProviderS3" must be defined in your config.`)
if (!config.koopProviderS3.stores) throw new Error(`ERROR: "koopProviderS3.stores" must be defined in your config.`)
const stores = config.koopProviderS3.stores

/**
 * Model constructor
 */
function Model () {}

/**
 * Fetch data from S3.  Pass result or error to callback.
 * @param {object} req express request object
 * @param {function} callback
 */
Model.prototype.getData = async function (req, callback) {
  // The host parameter is used as a key in the config to fetch a bucket name and required input serialization for the S3 file
  const storeConfig = stores[req.params.host]
  let error
  if (!storeConfig) error = new Error(`No configuration defined for "host": ${req.params.host}.`)
  else if (!storeConfig.serialization) error = new Error(`No input serialization defined for "host": ${req.params.host}.`)
  if (error) {
    error.code = 400
    return callback(error)
  }

  // TODO: use query parameters to construct SQL
  const sql = `SELECT * FROM S3Object s`

  // The "id" parameter holds the path to the S3 file; "/" are represented with "::", so replace here
  const key = req.params.id.replace(/::/g, '/')

  // Fetch the data from S3 and transform to GeoJSON
  fetchS3GeoJson(sql, key, storeConfig.serialization, { bucket: storeConfig.bucket })
    .then(geojson => {
      return callback(null, geojson)
    })
    .catch(err => {
      // S3 errors have a code in the form of a string and are usually due to
      if (err.code === 'NoSuchKey') {
        err.code = 400
        err.message = 'The requested file does not exist.'
      } else if (err.code === 'InvalidTextEncoding') {
        err.code = 500
        err.message = `${err.message} The compression type set in input serialization may not match this file.`
      } else if (typeof err.code === 'string') err.code = 500

      callback(err)
    })
}

module.exports = Model
