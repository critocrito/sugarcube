# `sugarcube/plugin-ddg`

This is a plugin for [sugarcube](https://gitlab.com/sugarcube/sugarcube).

Search on DuckDuckGo.

## Installation

```
npm install --save @sugarcube/plugin-ddg
```

## Plugins

This plugin exports a single transformation plugin:

### `ddg_search` plugin

```
$(npm bin)/sugarcube -c cfg.json -p ddg_search
```

This is a data fetching plugin.

It looks for the query terms of type `ddg_search`, e.g.:

```
[{
  "type": "ddg_search",
  "term": "Some Search Term"
}]
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
