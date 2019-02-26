const _ = require('lodash')

// Default field keys for storing point coordinates
const geometryKeys = [
  { x: 'longitude', y: 'latitude' },
  { x: 'lon', y: 'lat' },
  { x: 'x', y: 'y' }
]

/**
 * Assemble and return a Point geometry if the object contains the expected fields
 * @param {string} xKey object key for field holding X coordinate
 * @param {string} yKey object key for field holding Y coordinate
 * @param {object} obj
 */
function fetchPointGeometry (xKey, yKey, obj) {
  if (!obj[xKey] || !obj[yKey]) return

  return {
    type: 'Point',
    coordinates: [
      Number(obj[xKey]),
      Number(obj[yKey])
    ]
  }
}

/**
 * Search an object for a set of fields contain point coordinates.
 * Field must match one of the defined sets in "geometryKeys"
 * @param {*} obj
 */
function fetchPointGeometryKeys (obj) {
  let matchedKeys
  geometryKeys.some(keys => {
    matchedKeys = fuzzyFindGeometryKeys(keys.x, keys.y, obj)
    return matchedKeys
  })
  return matchedKeys
}

/**
 * For a given x-key and y-key, do a case-insenstive search on the object keys.
 * If both keys are found, and their values are numeric (or null), return the
 * match x-key and y-key names (as they may be mixed-case)
 * @param {*} fuzzyXKey
 * @param {*} fuzzyYKey
 * @param {*} obj
 */
function fuzzyFindGeometryKeys (fuzzyXKey, fuzzyYKey, obj) {
  const xKey = fuzzyFindKey(fuzzyXKey, obj)
  const yKey = fuzzyFindKey(fuzzyYKey, obj)
  // If keys are found, see if the values are numeric
  if (xKey && yKey && isNumericField(obj[xKey]) && isNumericField(obj[yKey])) return { x: xKey, y: yKey }
}

/**
 * Is the value null, and number, or a stringified number?
 * @param {*} value
 */
function isNumericField (value) {
  // Allow nulls
  if (value === null) return true
  return !isNaN(parseFloat(value))
}

/**
 * Performs a case-insensitive search of object keys for a given string,
 * e.g., fuzzyFindKey('Foo', { foo: 'bar' }) will return 'foo'.
 * @param {*} fuzzyKey - key to look for in object
 * @param {*} obj - object to search
 */
function fuzzyFindKey (fuzzyKey, obj) {
  return _.findKey(obj, (value, key) => {
    return key.toLowerCase() === fuzzyKey.toLowerCase()
  })
}

module.exports = {
  fetchPointGeometry,
  fetchPointGeometryKeys,
  fuzzyFindGeometryKeys,
  fuzzyFindKey
}
