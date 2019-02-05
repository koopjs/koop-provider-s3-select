const test = require('tape')
const _ = require('lodash')
const { isFeatureArray, isFeatureCollection, isFeatureGeometryArray, isObjectArray } = require('../lib/match-schema')
const objectArrFixture = require('./fixtures/object-array.json')
const featureArrFixture = require('./fixtures/feature-array.json')
const geometryArrFixture = require('./fixtures/geometry-array.json')
const featureCollectionArrFixture = require('./fixtures/feature-collection-array.json')

test('match-schema - confirm fixture is a feature collection', t => {
  t.plan(1)
  const result = isFeatureCollection(featureCollectionArrFixture)
  t.equals(result, true, 'confirms feature collection')
})

test('match-schema - reject fixture as a feature collection', t => {
  t.plan(1)
  const fixture = _.cloneDeep(featureCollectionArrFixture)
  _.unset(fixture[0], 'features')
  const result = isFeatureCollection(fixture)
  t.equals(result, false, 'rejects fixture as feature collection')
})

test('match-schema - confirm fixture is a feature array', t => {
  t.plan(1)
  const result = isFeatureArray(featureArrFixture)
  t.equals(result, true, 'confirms feature array')
})

test('match-schema - confirm empty array is a feature array', t => {
  t.plan(1)
  const result = isFeatureArray([])
  t.equals(result, true, 'confirms feature array')
})

test('match-schema - reject fixture as a feature array', t => {
  t.plan(1)
  const fixture = _.cloneDeep(featureArrFixture)
  fixture[0].foo = 'bar'
  _.unset(fixture[0], 'properties')
  const result = isFeatureArray(fixture)
  t.equals(result, false, 'rejects fixture as feature array')
})

test('match-schema - confirm fixture is a geometry array', t => {
  t.plan(1)
  const result = isFeatureGeometryArray(geometryArrFixture)
  t.equals(result, true, 'confirms geometry array')
})

test('match-schema - reject fixture as a geometry array', t => {
  t.plan(1)
  const fixture = _.cloneDeep(geometryArrFixture)
  fixture[0].foo = 'bar'
  _.unset(fixture[0], 'type')
  const result = isFeatureGeometryArray(fixture)
  t.equals(result, false, 'rejects fixture as geometry array')
})

test('match-schema - confirm fixture is an object array', t => {
  t.plan(1)
  const result = isObjectArray(objectArrFixture)
  t.equals(result, true, 'confirms object array')
})

test('match-schema - reject fixture as an object array', t => {
  t.plan(1)
  const fixture = _.cloneDeep(objectArrFixture)
  fixture[0] = 'bar'
  const result = isObjectArray(fixture)
  t.equals(result, false, 'rejects fixture as object array')
})
