# `@sugarcube/plugin-statsd`

A Sugarcube plugin that uses StatsD.

## Installation

```shell
npm install --save @sugarcube/plugin-statsd
```

## Instruments

### `statsd_metrics`

Store collected metrics in a StatsD backend. Each plugin can collect a series of counts and timers and this instrument allows to send those metrics to a StatsD backend. Theoretically any StatsD backend should work, but it has been tested using Telegraf. Metrics send by this instrument have the following data translation template:

```text
"sugarcube.* app.project.pipeline.measurement.field"
```

The measurement is named after the plugin that sends it. The field is a specific counter or timer.

**Configuration:**

- `statsd.host`: The hostname or IP address of the StatsD server. Defaults to `localhost`.
- `statsd.port`: The port of the StatsD server. Defaults to `8125`.
- `statsd.telegraf`: Set to `true` if using Telegraf as a StatsD server. Defaults to `true`.

**Example:**

```shell
sugarcube -I statsd_metrics -p youtube_channel
```

## License

[GPL3](./LICENSE) @ [Christo](christo@cryptodrunks.net)
