[![](https://img.shields.io/npm/v/@whi/essence/latest?style=flat-square)](http://npmjs.com/package/@whi/essence)

# Essence
A Javascript implementation for packing/unpacking contextual responses.  This could be considered as
a tool for the data translation layer.

[![](https://img.shields.io/github/issues-raw/mjbrisebois/essence-payloads-js?style=flat-square)](https://github.com/mjbrisebois/essence-payloads-js/issues)
[![](https://img.shields.io/github/issues-closed-raw/mjbrisebois/essence-payloads-js?style=flat-square)](https://github.com/mjbrisebois/essence-payloads-js/issues?q=is%3Aissue+is%3Aclosed)
[![](https://img.shields.io/github/issues-pr-raw/mjbrisebois/essence-payloads-js?style=flat-square)](https://github.com/mjbrisebois/essence-payloads-js/pulls)

## Overview
The main feature of this tool is packing or unpacking messages.

### Features

- Parse JSON encoded Essence package
- Create Essence package
- Create Essence package from value
- Create Essence package from a Javascript error

## Install

```bash
npm i @whi/essence
```

## Specification

See [docs/specification.md](docs/specification.md)

## Basic Usage

### Unpacking

Handling a success package
```javascript
const { Translator } = require("@whi/essence");
const Interpreter = new Translator();

let pack = Interpreter.parse({
    "type": "success",
    "payload": data,
});

let payload = pack.value();
// payload == data
```

Handling an failure package
```javascript
const { Translator } = require("@whi/essence");
const Interpreter = new Translator();

let pack = Interpreter.parse({
    "type": "failure",
    "payload": {
        "kind": "UserError",
        "error": "MissingInputError",
        "message": "You forgot the resource ID",
    },
});

let payload = pack.value();
// payload instanceof Error
```

### Packing

Creating a success package
```javascript
const { Translator } = require("@whi/essence");
const Interpreter = new Translator();

let pack = Interpreter.create( true );

JSON.stringify( pack, null, 4 );
// {
//     "type": "success",
//     "payload": true
// }
```

Creating a failure package
```javascript
const { Translator } = require("@whi/essence");
const Interpreter = new Translator();

let pack = Interpreter.createFromError( "UserError", new TypeError("You broke it...") );

JSON.stringify( pack, null, 4 );
// {
//     "type": "failure",
//     "payload": {
//         "kind": "UserError",
//         "error": "TypeError",
//         "message": "You broke it",
//         "stack": [
//             "TypeError: You broke it",
//             "    at ...",
//             ...
//         ]
//     }
// }
```



### API Reference

See [docs/API.md](docs/API.md)

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
