[back to README.md](../README.md)

## Essence Specification

### Architecture
Each layer gives additional meaning (routing) to data.

- **Tranport Layer** - gives your data a network path accross the internet.
- **Context Layer** - `Essence` gives definition to this layer.
- **Content Layer** - you handle this.

### Message Format

- `type` - (*required*) defines the state; success or failure
- `payload` - (*required*) contains the message's content
- `metadata` - (*optional*) available for defining additional context

#### Success
This means the request was successful and the payload contains the desired response content.

- `payload` - (*required*) can be any value

```javascript
{
    "type": "success",
    "metadata": ?{
        [key]: any
    },
    "payload": any,
}
```

#### Failure
This means the request was unsuccessful and the payload contains an error describing the issue.

- `payload` - (*required*) must have error structure
  - `kind` - (*required*) use this value to indicate WHERE the fault lies
    - eg. User, Client, App, Server, etc...
  - `error` - (*required*) use this value to indicate WHAT this type of error is
    - eg. InvalidInput, QueryError, TimeoutError, etc...
  - `message` - (*required*) use this value to describe WHY this error occurred
  - `stack` - (*optional*) use this value to show WHEN (possibly HOW) this error occurred

```javascript
{
    "type": "failure",
    "metadata": ?{
        [key]: any
    },
    "payload": {
        "kind": string,
	"error": string,
	"message": string,
	"stack": ?array<string>
    }
}
```
