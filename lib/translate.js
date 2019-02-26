const { isFeatureArray, isFeatureCollection, isFeatureGeometryArray, isObjectArray } = require('./match-schema')
const { fetchPointGeometry, fetchPointGeometryKeys } = require('./fetch-point-geometry')
/**
 * Translate JSON array to GeoJSON
 * @param {object[]} json JSON array
 * @returns {object} standardized feature collection
 */

function translate (json) {
  if (!Array.isArray(json)) throw new Error('Expected JSON array.')

  // Match input JSON to a specified schema, then translate to GeoJSON feature collection
  if (isFeatureCollection(json)) return json[0]
  if (isFeatureArray(json)) return translateFeatureArray(json)
  if (isFeatureGeometryArray(json)) return translateFeatureGeometryArray(json)
  if (isObjectArray(json)) return translateObjectArray(json)

  // If here, the input json is an array of strings or primatives
  throw new Error('S3 file contents cannot be translated to GeoJSON.')
}

/**
 * Convert an array of GeoJSON features to a GeoJSON feature collection
 * @param {object[]} features GeoJSON feature array
 * @returns {object} standardized feature collection
 */
function translateFeatureArray (features) {
  return {
    'type': 'FeatureCollection',
    'features': features
  }
}

/**
 * Convert an array of GeoJSON geometries to a GeoJSON feature collection
 * @param {object[]} geometryCollection GeoJSON geometry object
 * @returns {object} standardized feature collection
 */
function translateFeatureGeometryArray (geometryCollection) {
  const features = geometryCollection.map(geometry => {
    return {
      geometry,
      properties: {}
    }
  })
  return {
    type: 'FeatureCollection',
    features
  }
}

/**
 * Convert an array of objects to a GeoJSON feature collection
 * @param {object[]} arr simple object array
 * @returns {object} standardized feature collection
 */
function translateObjectArray (arr) {
  const geometryKeys = fetchPointGeometryKeys(arr[0])

  const features = arr.map(record => {
    let geometry
    if (geometryKeys) geometry = fetchPointGeometry(geometryKeys.x, geometryKeys.y, record)

    return {
      properties: record,
      geometry
    }
  })
  return {
    type: 'FeatureCollection',
    features
  }
}
module.exports = {
  translate,
  translateFeatureArray,
  translateFeatureGeometryArray,
  translateObjectArray
}
