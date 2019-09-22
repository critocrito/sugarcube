---
path: "/events"
title: "Pipeline Events"
---

# Events

During the run of a SugarCube pipeline a variety of events are emitted at different stages of the run or if something exceptional is happening. Instruments can listen to those events to react to them. Every event emits an data about the event. The event emitter is stored as the `events` field on the runner function.

## run

The *run** event is emitted once at the start of a pipeline run.

**Fields:**

- `marker` :: The unique id of the pipeline run.

**Examples:**

```js
run.events.on("run", ({marker}) => console.log(`Started run ${marker}`));
```

## end

The *end* event is emitted once at the end of the pipeline run. The pipeline finished after emitting this event. The *end* event has no data attached.

## error

When an error occurs during a pipeline run the error is emitted using the *error* event. The event emits the [`Error` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) containing the stack trace. The runner should listen for this event and has to decide how to react in case of an error. The policy of the `sugarcube` command line tool is to stop the pipeline run in case of any error.

**Examples:**

```js
run.events.on("error", (ex) => {
  console.log(ex.message);
  process.exit(1);
});
```

## plugin_start

At the beginning of every plugin the *plugin_start* event is emitted. It contains the name of the plugin and the timestamp when the plugin is started.

**Fields:**

- `plugin` :: The name of the plugin.
- `ts` :: The [`Date` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) when the plugin started.

**Examples:**

```js
run.events.on("plugin_start", ({plugin, ts}) => {
  console.log(`The ${plugin} plugin started at ${ts.toISOString()}`);
});
```

## plugin_end

Once a plugin finishes the *plugin_end* event is emitted. It contains the name of the plugin, the timestamp when the plugin ended and an object containing statistics collected for the plugin.

**Fields:**

- `plugin` :: The name of the plugin.
- `ts` :: The [`Date` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) when the plugin ended.
- `stats` :: An object of statistics collected for the plugin. Statistics can be *counts* and *durations* a each is an object again. The `stats` object always contains the time the plugin took in milliseconds but plugins can add additional counts and durations.

**Examples:**

```js
run.on.events("plugin_end", ({plugin, stats}) => {
  const {took} = stats.durations;
  console.log(`Plugin ${plugin} took ${took} ms.`);
});
```

## log

Log messages are emitted with the *log* event. It contains the level of the log message and the message itself. The `sugarcube` command line tool listens to those events to print them to STDOUT.

**Fields:**

- `type` :: The level of the log message, can be *info*, *warn*, *debug* or *error*.
- `msg` :: The log message.

## fail

Failures that happen in a plugin are emitted using the *fail* event. Those can be, e.g. if a query didn't fetch or something else doesn't succeed but isn't an error. For example the `csv_failures_file` instrument writes failures to a CSV file and the `sugarcube` command line tool logs them as warnings to STDOUT.

**Fields:**

- `type` :: The query source that failed, e.g. `youtube_channel`.
- `term` :: The query term that failed, e.g. the Youtube channel ID.
- `reason` :: An explanation on what went wrong.
- `plugin` :: The plugin that triggered the fail.

**Examples:**

```js
run.events.on("fail", ({term, reason}) => console.log(`${term} failed: ${reason}`));
```

## stats

The end of the pipeline triggers the *stats* event that contains all internal stats collected during the pipeline run. This includes stats on each plugin, as well as the pipeline itself, and all collected failures. The `sugarcube` command line tool listens on this event to print out statistics at the end of a pipeline run.

**Fields:**

- `stats` :: An object containing all statistics and failures collected during the pipeline run.

## count

Plugins can collect counter metrics about the performance of the ongoing pipeline run, e.g. the total count of Youtube videos fetched from Youtube channels or the number of videos downloaded using `youtube-dl`. The `statsd_metrics` instrument uses those counters to send them to a StatsD backend.

**Fields:**

- `type` :: The name of the metric. The metric name is composed of the plugin name and the metric field, e.g. *media_youtubedl.fetched*.
- `term` :: The number to increment the metric with.
- `marker` :: The marker of the pipeline run that generated the metric.

## duration

Plugins can measure durations on how long something takes. Those timings are added to the plugin stats as well.

**Fields:**

- `type` :: The name of the metric. The metric name is composed of the plugin name and the metric field.
- `term` :: The duration measured in milliseconds associated with the metric.
- `marker` :: The marker of the pipeline run that generated the metric.
