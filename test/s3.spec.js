const test = require('tape')
const { s3StringToJson } = require('../lib/s3')

test('s3StringToJson', t => {
  t.plan(1)
  const fixture = `{"col1":"1","col2":"foo"}
  {"col1":"2","col2":"bar"}
  `
  const expected = [
    { col1: '1', col2: 'foo' },
    { col1: '2', col2: 'bar' },
    undefined
  ]
  const result = s3StringToJson(fixture)
  t.deepEquals(result, expected, 'confirms feature collection')
})
