# `@sugarcube/plugin-sec`

Search the U.S. Securities and Exchange Commission filings.

## Installation

```shell
npm install --save @sugarcube/plugin-sec
```

## Plugins

### `sec_search`

Search the SEC for filings. Currently only SD forms are fetched. The query
type is `sec_search`;

```shell
sugarcube -Q sec_search:"Social Media" -p sec_search,tap_printf
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
