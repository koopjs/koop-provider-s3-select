const test = require('tape')

const {
  fuzzyFindKey,
  fuzzyFindGeometryKeys,
  fetchPointGeometryKeys,
  fetchPointGeometry
} = require('../lib/fetch-point-geometry')

test('fuzzyFindKey', t => {
  t.plan(1)
  const fixture = {
    fOo: 'bar'
  }
  const result = fuzzyFindKey('FoO', fixture)
  t.equals(result, 'fOo', 'returns key name that is a case-insentive match')
})

test('fuzzyFindGeometryKeys - found', t => {
  t.plan(2)
  const fixture = {
    Latitude: '-10.2',
    Longitude: '122.3'
  }
  const result = fuzzyFindGeometryKeys('longitude', 'latitude', fixture)
  t.equals(result.x, 'Longitude', 'returns key name that is a case-insentive match and has a numeric value')
  t.equals(result.y, 'Latitude', 'returns key name that is a case-insentive match and has a numeric value')
})

test('fuzzyFindGeometryKeys - key not found', t => {
  t.plan(1)
  const fixture = {
    foo: -10.2,
    Longitude: 122.3
  }
  const result = fuzzyFindGeometryKeys('longitude', 'latitude', fixture)
  t.notOk(result, 'both keys not found')
})

test('fuzzyFindGeometryKeys - key not found', t => {
  t.plan(1)
  const fixture = {
    Latitude: -10.2,
    foo: 122.3
  }
  const result = fuzzyFindGeometryKeys('longitude', 'latitude', fixture)
  t.notOk(result, 'both keys not found')
})

test('fuzzyFindGeometryKeys - value not numeric', t => {
  t.plan(1)
  const fixture = {
    Latitude: -10.2,
    Longitude: true
  }
  const result = fuzzyFindGeometryKeys('longitude', 'latitude', fixture)
  t.notOk(result, 'both keys not numeric')
})

test('fuzzyFindGeometryKeys - value not numeric', t => {
  t.plan(1)
  const fixture = {
    Latitude: false,
    Longitude: 122.3
  }
  const result = fuzzyFindGeometryKeys('longitude', 'latitude', fixture)
  t.notOk(result, 'both keys not numeric')
})

test('fuzzyFindGeometryKeys - value not numeric', t => {
  t.plan(1)
  const fixture = {
    Latitude: -10.2,
    Longitude: true
  }
  const result = fuzzyFindGeometryKeys('longitude', 'latitude', fixture)
  t.notOk(result, 'both keys not numeric')
})

test('fetchPointGeometryKeys - longitude/latitude', t => {
  t.plan(1)
  const fixture = {
    Latitude: -10.2,
    Longitude: 122.3
  }
  const result = fetchPointGeometryKeys(fixture)
  t.deepEquals(result, { x: 'Longitude', y: 'Latitude' }, 'found latitude/longitude keys')
})

test('fetchPointGeometryKeys - lon/lat', t => {
  t.plan(1)
  const fixture = {
    Lat: -10.2,
    Lon: 122.3
  }
  const result = fetchPointGeometryKeys(fixture)
  t.deepEquals(result, { x: 'Lon', y: 'Lat' }, 'found lat/lon keys')
})

test('fetchPointGeometryKeys - x/y', t => {
  t.plan(1)
  const fixture = {
    Y: -10.2,
    X: 122.3
  }
  const result = fetchPointGeometryKeys(fixture)
  t.deepEquals(result, { x: 'X', y: 'Y' }, 'found x/y keys')
})

test('fetchPointGeometryKeys - not found', t => {
  t.plan(1)
  const fixture = {
    Y: -10.2,
    lon: 122.3
  }
  const result = fetchPointGeometryKeys(fixture)
  t.notOk(result, 'key pair not found')
})

test('fetchPointGeometryKeys - x/y', t => {
  t.plan(1)
  const fixture = {
    Y: -10.2,
    X: 122.3
  }
  const result = fetchPointGeometry('X', 'Y', fixture)
  t.deepEquals(result, {
    type: 'Point',
    coordinates: [
      122.3,
      -10.2
    ]
  }, 'returns expected object')
})

test('fetchPointGeometryKeys - x/y', t => {
  t.plan(1)
  const fixture = {
    fOo: 'bar'
  }
  const result = fetchPointGeometry('X', 'Y', fixture)
  t.notOk(result, 'returns undefined')
})
