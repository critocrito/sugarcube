# `@sugarcube/plugin-test`

Plugins to test aspects of SugarCube.

## Installation

```
npm install --save @sugarcube/plugin-test
```

## Plugins

## `test_generate` plugin

Generate random data using the `data` generator from the `@sugarcube/test`
package.

**Configuration Options:**

- `test.data_size`: Specify the amount of units to generate. The actual number of units produced can be less than specified because units with duplicate `_sc_id_hash` values are merged.

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
