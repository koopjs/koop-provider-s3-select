const test = require('tape')
const Joi = require('joi')

const {
  translate,
  translateFeatureArray,
  translateFeatureGeometryArray,
  translateObjectArray
} = require('../lib/translate')

const objectArrFixture = require('./fixtures/object-array.json')
const objectArrGeomFixture = require('./fixtures/object-array-with-geom.json')
const featureArrFixture = require('./fixtures/feature-array.json')
const geometryArrFixture = require('./fixtures/geometry-array.json')
const featureCollectionArrFixture = require('./fixtures/feature-collection-array.json')

// Schema for a GeoJSON feature collection
const schemaFeatureCollection = Joi.object().keys({
  type: Joi.string().required().valid('FeatureCollection').optional(),
  features: Joi.array().items(Joi.object().keys({
    type: Joi.string().valid('Feature'),
    properties: Joi.object().required(),
    geometry: Joi.object().keys({
      type: Joi.string().valid(['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon']),
      coordinates: Joi.array()
    }).default({})
  }).required())
})

test('translate -  a feature array to a GeoJSON feature collection', t => {
  t.plan(1)
  const result = translateFeatureArray(featureArrFixture)
  t.notOk(Joi.validate(result, schemaFeatureCollection).error, 'matches feature collection schema')
})

test('translate -  a feature geometry array to a GeoJSON feature collection', t => {
  t.plan(1)
  const result = translateFeatureGeometryArray(geometryArrFixture)
  t.notOk(Joi.validate(result, schemaFeatureCollection).error, 'matches feature collection schema')
})

test('translate -  an object array to a GeoJSON feature collection', t => {
  t.plan(1)
  const result = translateObjectArray(objectArrFixture)
  t.notOk(Joi.validate(result, schemaFeatureCollection).error, 'matches feature collection schema')
})

test('translate -  an object array with geometry fields to a GeoJSON feature collection', t => {
  t.plan(2)
  const result = translateObjectArray(objectArrGeomFixture)
  t.notOk(Joi.validate(result, schemaFeatureCollection).error, 'matches feature collection schema')
  t.deepEquals(result.features[0].geometry, {
    type: 'Point',
    coordinates: [-122.5, 48.6]
  }, 'geometry properly translated')
})

test('translate -  a feature array to a GeoJSON feature collection', t => {
  t.plan(1)
  const result = translate(featureArrFixture)
  t.notOk(Joi.validate(result, schemaFeatureCollection).error, 'matches feature collection schema')
})

test('translate -  a feature geometry array to a GeoJSON feature collection', t => {
  t.plan(1)
  const result = translate(geometryArrFixture)
  t.notOk(Joi.validate(result, schemaFeatureCollection).error, 'matches feature collection schema')
})

test('translate -  an object array to a GeoJSON feature collection', t => {
  t.plan(1)
  const result = translate(objectArrFixture)
  t.notOk(Joi.validate(result, schemaFeatureCollection).error, 'matches feature collection schema')
})

test('translate -  an array with a single feature collection to a GeoJSON feature collection', t => {
  t.plan(1)
  const result = translate(featureCollectionArrFixture)
  t.notOk(Joi.validate(result, schemaFeatureCollection).error, 'matches feature collection schema')
})

test('translate - throw error when input is not an array', t => {
  t.plan(1)
  try {
    const result = translate('test')
    t.notOk(result, 'should have thrown')
  } catch (e) {
    t.ok(e, 'throws error when input is not an array')
  }
})

test('translate - throw error when input is array or primatives', t => {
  t.plan(1)
  try {
    const result = translate(['test'])
    t.notOk(result, 'should have thrown')
  } catch (e) {
    t.ok(e, 'throws error when input is an array of primatives')
  }
})
