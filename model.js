const path = require('path')
const select = require('./lib/s3')
const { translate } = require('./lib/translate')
const config = require('config')
if (!config.koopProviderS3Select) throw new Error(`ERROR: "koopProviderS3Select" must be defined in your config.`)
if (!config.koopProviderS3Select.stores) throw new Error(`ERROR: "koopProviderS3Select.stores" must be defined in your config.`)
const stores = config.koopProviderS3Select.stores

/**
 * Model constructor
 */
function Model () {}

/**
 * Fetch data from S3. Pass result or error to callback.
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

  // The "id" parameter holds the path to the S3 file; "/" are represented with "::", so replace here
  const key = req.params.id.replace(/::/g, '/')

  // Determine bucket and key path
  const s3Path = path.normalize((storeConfig.s3Path || config.koopProviderS3Select.s3Path) + `/${key}`)
  const s3PathArr = s3Path.split('/')
  if (s3PathArr[0] === '') s3PathArr.shift()
  const bucket = s3PathArr[0]
  s3PathArr.shift()
  const keyPath = s3PathArr.join('/')

  // TODO: use query parameters to construct SQL
  const sql = `SELECT * FROM S3Object s`

  const params = {
    Bucket: bucket,
    Key: keyPath,
    Expression: sql,
    InputSerialization: storeConfig.serialization,
    ExpressionType: 'SQL',
    OutputSerialization: {
      JSON: {}
    }
  }

  try {
    const json = await select(params)
    const geojson = translate(json)

    // TODO: Once query parameters are used in SQL select, add metadata annotations 
    // so output-services don't duplicate post-processing; e.g., geojson.metadata.filtersApplied.where
    return callback(null, geojson)
  } catch (error) {
    return callback(error)
  }
}

module.exports = Model
