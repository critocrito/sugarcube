# `@sugarcube/plugin-aqicn`

Scrape `http://aqicn.org/`.

## Usage

```
npm install --save @sugarcube/plugin-aqicn
```

## Plugins

### `aqicn_station` plugin

Query the air pollution data of a single station. The query type is
`aqicn_station`.

```
sugarcube -Q aqicn_station:serbia/beograd/mostar -p aqicn_station,tap_printf
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
