const Joi = require('joi')

// Schema for a GeoJSON geometry
const schemaFeatureGeometry = Joi.object().keys({
  type: Joi.string().valid(['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon']),
  coordinates: Joi.array()
}).required()

// Schema for a GeoJSON feature
const schemaFeature = Joi.object().keys({
  type: Joi.string().valid('Feature'),
  properties: Joi.object().required(),
  geometry: schemaFeatureGeometry.default({})
})

// Schema for a GeoJSON feature collection
const schemaFeatureCollection = Joi.object().keys({
  type: Joi.string().valid('FeatureCollection').default('FeatureCollection').optional(),
  features: Joi.array().items(schemaFeature).required()
})

/**
 * Test if input is a GeoJSON Feature Collection
 * @param {*} json
 * @returns {boolean}
 */
function isFeatureCollection (json) {
  if (json.length !== 1) return false
  if (Joi.validate(json[0], schemaFeatureCollection).error) return false
  return true
}

/**
 * Test if input is a GeoJSON Geometry
 * @param {object[]} json
 * @returns {boolean}
 */
function isFeatureGeometryArray (json) {
  if (Joi.validate(json[0], schemaFeatureGeometry).error) return false
  return true
}

/**
 * Test if input is an array of GeoJSON features
 * @param {object[]} json
 * @returns {boolean}
 */
function isFeatureArray (json) {
  // Allow empty arrays
  if (json.length === 0) return true
  // Only check first array element; the array could be huge
  if (Joi.validate(json[0], schemaFeature).error) return false
  return true
}

/**
 * Test if input is an array of objects
 * @param {object[]} json
 * @returns {boolean}
 */
function isObjectArray (json) {
  if (json.length === 0) return true
  // Only check first array element; the array could be huge
  if (Joi.validate(json[0], Joi.object()).error) return false
  return true
}

module.exports = { isFeatureArray, isFeatureCollection, isFeatureGeometryArray, isObjectArray }
