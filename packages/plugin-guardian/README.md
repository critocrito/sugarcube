# `@sugarcube/plugin-guardian`

Query the [The Guardian open-platform](http://open-platform.theguardian.com/).

## Installation

```shell
npm install --save @sugarcube/plugin-guardian
```

### Register for an API key

Browse to the [Sign-Up page](https://bonobo.capi.gutools.co.uk/register/developer). You need to specify a valid Email. The API key will be send to you.

## Plugins

### `guardian_search`

This plugin searches the Guardian archive. The query type is `guardian_search`.

**Configuration:**

- `guardian.key`: The API key you received after signing up.

**Example:**

```shell
$(npm bin)/sugarcube -p guardian_search \
                     -Q guardian_search:Keith\ Johnstone \
                     --guardian.key <your API key>
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
