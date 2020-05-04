# `@sugarcube/plugin-tap`

Plugins for SugarCube for side effect only.

## Installation

```shell
npm install --save @sugarcube/plugin-tap
```

## Plugins

### `tap_printf`

```shell
$(npm bin)/sugarcube -c cfg.json -p twitter_feed,tap_printf
```

Prints the whole envelope (i.e. data and queries) and the full configuration
to the screen.

**Configuration**:

- `tap.select` :: Specify the elements to print to the screen. Defaults to
  `data`. Valid values are `data`, `queries`, `stats`, `cache`, `plugins` and
  `cfg`. Specify multiple values by separating values by a comma.

  Example: Print only data and queries to the screen.

  `$(npm bin)/sugarcube -p tap_printf --tap.select data,queries`

- `tap.limit` :: Limit the output to X data units.

  Example: Print only 5 units of data.

  `$(npm bin)/sugarcube -c cfg.json -p twitter_feed,tap_printf --tap.limit 5`

- `tap.exclude` :: Exclude those fields from printing.

  `$(npm bin)/sugarcube -c cfg.json -p http_import,tap_printf --tap.exclude body,_sc_body`

### `tap_writef`

```shell
$(npm bin)/sugarcube -c cfg.json -p twitter_feed,tap_writef
```

Write the data part of the envelope to a file.

**Configuration**:

- `tap.limit` :: Limit the output to N data units.

  Example: Print only 5 units of data.

  `$(npm bin)/sugarcube -c cfg.json -p twitter_feed,tap_writef --tap.limit 5`

- `tap.filename` :: Specify the name of the output file. Defaults to
  `data-<marker>.json`.

- `tap.chunk_size` :: Split the data into multiple chunks and write each chunk
  into it's own file. The file name is based on `tap.filename` but the chunk id
  is injected into the filename.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
