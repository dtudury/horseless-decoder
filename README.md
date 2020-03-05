# horseless.decoder

HTML templates with interpolated values.

## Why?

HTML is great at one thing: describing how to build a web page. JavaScript is great at lots of things... but it's horrible at describing how to build a web page. This project turns an HTML template language into a JavaScript-accessible description of how to build a web page. It's then fairly easy to use JavaScript to follow the description and create elements matching the description

## How does it work?

Horseless.decoder exposes one tag: `h`.

### `h`

`h` is a tag for literal strings. It accepts an HTML-like language and returns an array of descriptions of the described nodes as JavaScript objects.
```
h`<w a="b">c</w>x<y/>z`
```
becomes
```
[
  {"type":"node","tag":"w","attributes":{"a":["b"]},"children":[
    {"type":"textnode","value":"c"}
  ],"xmlns":"http://www.w3.org/1999/xhtml"},
  {"type":"textnode","value":"x"},
  {"type":"node","tag":"y","attributes":{},"children":[],"xmlns":"http://www.w3.org/1999/xhtml"},
  {"type":"textnode","value":"z"}
]
```
Note that attribute values are represented as arrays. This is to allow for data interpolation within attribute values.

#### value interpolation

##### text nodes

```
let b = h`b`
h`a${b}c`
```
becomes
```
[
  {"type":"textnode","value":"a"},
  {"type":"textnode","value":"b"},
  {"type":"textnode","value":"c"}
]
```

##### tags
```
let tag = 'span'
h`<${tag} />`
```
becomes
```
[
  {"type":"node","tag":"span","attributes":{},"children":[],"xmlns":"http://www.w3.org/1999/xhtml"}
]
```

##### attributes
```
let x = '1'
let yz = { y: '2', z: '3' }
h`<a x=${x} ${yz}>`
```
becomes
```
[
  {"type":"node","tag":"a","attributes":{"x":"1","y":"2","z":"3"},"children":[],"xmlns":"http://www.w3.org/1999/xhtml"}
]
```

##### children
```
let wx = h`<w/><x/>`
h`<a>${wx[1]}<y/><z/></a>`
```
becomes
```
[
  {"type":"node","tag":"a","attributes":{},"children":[
    {"type":"node","tag":"x","attributes":{},"children":[],"xmlns":"http://www.w3.org/1999/xhtml"},
    {"type":"node","tag":"y","attributes":{},"children":[],"xmlns":"http://www.w3.org/1999/xhtml"},
    {"type":"node","tag":"z","attributes":{},"children":[],"xmlns":"http://www.w3.org/1999/xhtml"}
  ],"xmlns":"http://www.w3.org/1999/xhtml"}
]
```

#### overriding default xmlns
If `h` is called as `h(xmlns)` the resulting xmlns attributes will default to the passed in value instead of `http://www.w3.org/1999/xhtml`

#### xmlns inheritance
If the `xmlns` property is set in the HTML then the output node will use that property value for it's xmlns attribute. The xmlns of it's children will also be set to that property
```
h`<svg xmlns="http://www.w3.org/2000/svg"><p/></svg>`
```
becomes
```
[
  {"type":"node","tag":"svg","attributes":{"xmlns":["http://www.w3.org/2000/svg"]},"children":[
    {"type":"node","tag":"p","attributes":{},"children":[],"xmlns":"http://www.w3.org/2000/svg"}
  ],"xmlns":"http://www.w3.org/2000/svg"}
]
```

### "HTML-like"?

It doesn't check every box in the standard. It's close enough that you can paste any sane code and get what you're expecting with little-to-no manual cleanup. It handles void elements, boolean attributes, and unquoted attribute values (contributions welcome).

### TODO

Handle closing tags better. Currently all closing tags are treated the same, closing whichever node was most recently opened. Mismatched nodes are handled with obliviosness. The bad HTML but obvious intention of `<i>this part is italic <b>this part is bold and italic </i> this part is just bold</b>` should be handled as intended (or it should error but that's not very HTML'y)

Better errors. Maybe give a hint as to where the error occurred?
