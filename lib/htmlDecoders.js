import { skipWhiteSpace, readTo, readToArr, readValue, assertChar, readIf } from './basicDecoders.js'
import { FRAGMENT } from './fragment.js'

// https://html.spec.whatwg.org/multipage/syntax.html#void-elements
const _voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

function _decodeAttribute (arr) {
  skipWhiteSpace(arr)
  const c = arr[arr.i]
  if (c === '/' || c === '>') {
    return
  }
  let name = readValue(arr)
  if (name && name.isValue) {
    return name.value
  } else {
    name = readTo(arr, /[\s=/>]/)
  }
  skipWhiteSpace(arr)
  const equalSign = readIf(arr, '=')
  if (equalSign) {
    skipWhiteSpace(arr)
    let value = readValue(arr)
    if (value) {
      value = value.value
    } else {
      const quote = readIf(arr, /['"]/)
      if (quote) {
        value = readToArr(arr, quote)
        assertChar(arr, quote)
      } else {
        value = readTo(arr, /[\s=/>]/)
      }
    }
    return { [name]: value }
  } else {
    return { [name]: name }
  }
}

function _decodeAttributes (arr) {
  const out = {}
  while (true) {
    const attribute = _decodeAttribute(arr)
    if (attribute) {
      Object.assign(out, attribute)
    } else {
      return out
    }
  }
}

function _decodeTag (arr) {
  skipWhiteSpace(arr)
  const c = arr[arr.i]
  if (c.isValue) {
    arr.i++
    return c.value
  }
  return readTo(arr, /[\s/>]/)
}

function _decodeElement (arr, xmlns) {
  const c = arr[arr.i]
  if (c.isValue) {
    arr.i++
    return c.value
  } else if (c === '<') {
    assertChar(arr, /</)
    let isClosing = readIf(arr, '/')
    const tag = _decodeTag(arr) || FRAGMENT
    const isVoid = _voidElements.has(tag)
    isClosing = isClosing && !isVoid
    const attributes = _decodeAttributes(arr)
    xmlns = attributes.xmlns || xmlns
    const isEmpty = readIf(arr, '/') || isVoid
    assertChar(arr, />/)
    const children = (isClosing || isEmpty) ? [] : _decodeElements(arr, tag, xmlns)
    return { type: 'node', tag, attributes, children, isClosing, xmlns }
  } else {
    return { type: 'textnode', value: readTo(arr, /</) }
  }
}

function _decodeElements (arr, closingTag, xmlns) {
  const nodes = []
  while (arr.i < arr.length) {
    const node = _decodeElement(arr, xmlns)
    if (node) {
      if (node.isClosing) {
        if (closingTag) {
          return nodes
        }
      } else {
        delete node.isClosing
        nodes.push(node)
      }
    }
  }
  return [].concat.apply([], nodes)
}

export function h (strings, ...values) {
  let xmlns = 'http://www.w3.org/1999/xhtml'
  function _h (strings, ...values) {
    const ss = [strings[0].split('')]
    for (let i = 0; i < values.length; i++) {
      ss.push({ value: values[i], isValue: true })
      ss.push(strings[i + 1].split(''))
    }
    const arr = [].concat.apply([], ss)
    arr.i = 0
    return _decodeElements(arr, null, xmlns)
  }
  if (Array.isArray(strings)) {
    return _h(strings, ...values)
  } else {
    xmlns = strings
    return _h
  }
}
