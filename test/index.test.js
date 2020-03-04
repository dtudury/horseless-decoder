
/* global describe it */
import { assert } from 'chai'
import { h } from '../index.js'

describe('h', function () {
  describe('basic decoding', function () {
    it('should parse basic html-like strings', function () {
      const decoded = h`<x a="b">c</x>def`
      assert.deepEqual(decoded, [
        {
          type: 'node',
          tag: 'x',
          attributes: { a: ['b'] },
          children: [{ type: 'textnode', value: 'c' }],
          xmlns: 'http://www.w3.org/1999/xhtml'
        },
        { type: 'textnode', value: 'def' }
      ])
      assert.throws(function () { h`<a/ ` })
    })
    it('should parse html escaped strings', function () {
      const decoded = h`&amp;&apos;&gt;&lt;&quot;<a b="&amp;&apos;&gt;&lt;&quot;"/>`
      assert.equal(decoded[0].value, '&\'><"')
      assert.equal(decoded[1].attributes.b, '&\'><"')
      assert.throws(function () { h`&nope;` })
    })
    it('whould parse elements with values', function () {
      const decoded = h`<${'a'} ${{ b: 'c' }} />`
      assert.equal(decoded[0].tag, 'a')
      assert.deepEqual(decoded[0].attributes, { b: 'c' })
    })
    it('should parse attributes with values as arrays of strings interpolated with values', function () {
      const decoded = h`<a b="${1} 2 ${3}"/>`
      assert.deepEqual(decoded[0].attributes.b, [1, ' 2 ', 3])
    })
  })
})
