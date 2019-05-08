# `@sugarcube/plugin-guardian`

Query the [The Guardian open-platform](http://open-platform.theguardian.com/).

## Register for an API key

Browse to the
[Sign-Up page](https://bonobo.capi.gutools.co.uk/register/developer). You need
to specify a valid Email. The API key will be send to you.

## Plugins

- `guardian_search` plugin

This plugin searches the Guardian archive. The query type is
`guardian_search`.

```
$(npm bin)/sugarcube -Q guardian_search:Keith\ Johnstone -p guardian_search
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
