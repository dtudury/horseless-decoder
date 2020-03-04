
/* global describe it */
import { assert } from 'chai'
import { h, FRAGMENT } from '../index.js'

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
    it('should parse elements with values for tags and attributes', function () {
      const decoded = h`<${'a'} ${{ b: 'c' }} />`
      assert.equal(decoded[0].tag, 'a')
      assert.deepEqual(decoded[0].attributes, { b: 'c' })
    })
    it('should parse attributes with interpolated values', function () {
      const decoded = h`<a b="${1} 2 ${3}" c=${4}/>`
      assert.deepEqual(decoded[0].attributes.b, [1, ' 2 ', 3])
      assert.equal(decoded[0].attributes.c, 4)
    })
    it('should parse values as elements', function () {
      const decoded = h`${1}<a>${h`<b>c</b>`}</a>${null}`
      assert.equal(decoded[1].children[0][0].children[0].value, 'c')
      assert.equal(decoded.length, 2)
    })
    it('should parse fragment nodes', function () {
      const decoded = h`<>a</>`
      assert.equal(decoded[0].tag, FRAGMENT)
      assert.equal(decoded[0].children[0].value, 'a')
    })
    it('should handle different namespaces', function () {
      assert.equal(h`<html/>`[0].xmlns, 'http://www.w3.org/1999/xhtml')
      assert.equal(h('http://www.w3.org/2000/svg')`<svg/>`[0].xmlns, 'http://www.w3.org/2000/svg')
    })
  })
  describe('html special decoding', function () {
    //it('should handle void elements')
    //it('should handle boolean attributes')
    //it('should handle unquoted attributes')
  })
})
