[back to README.md](README.md)

# Contributing

## Overview
This package is designed to work with transport protocols that send JSON payload (such as HTTP or
WebSocket).  Although, it can be useful for any transport that let's you send JSON payloads.

### Potential features

- Handle YAML messages
- Handle TOML messages

## Development

See [docs/API.md](docs/API.md) for detailed API References

### Environment

- Developed using Node.js `v12.20.0`

### Building

- bundled to UMD by `webpack`

```
make dist
```

### Testing

To run all tests with logging
```
make test-debug
```

- `make test-unit-debug` - **Unit tests only**
- `make test-integration-debug` - **Integration tests only**

> **NOTE:** remove `-debug` to run tests without logging
