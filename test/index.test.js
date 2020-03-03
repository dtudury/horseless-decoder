
/* global describe it */
import { assert } from 'chai'
import { h } from '../index.js'

describe('h', function () {
  it('should parse basic html-like strings', function () {
    const decoded = h`<x a="b">c</x>`
    console.log(JSON.stringify(decoded))
  })
  it('should parse html escaped strings', function () {
    const decoded = h`&amp;&apos;&gt;&lt;&quot;`
    assert.deepEqual(decoded, [{ type: 'textnode', value: '&\'><"' }])
    assert.throws(function () { h`&nope;` })
  })
})
