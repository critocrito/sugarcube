import {flow, map, zip, merge, size} from "lodash/fp";
import Bacon from "baconjs";
import {flowP, caughtP, tapP, foldP} from "dashp";

import {liftManyA2} from "./data/plugin";
import {envelopeQueries, fmapData, filterData} from "./data/envelope";
import ds from "./data/data";
import {state} from "./state";
import {uid, generateSeed} from "./crypto";
import {now, curry2, curry3, curry4} from "./utils";

// The following functions provide funtionalities that should be run every
// time a plugin is run. The plugin runner composes them with the plugin.
const pluginStats = curry4("pluginStats", (stream, name, stats, envelope) => {
  const total = size(envelope.data);
  stream.push({type: "plugin_stats", plugin: name, total});
  stats.update("pipeline", st => merge(st, {total}));
  return envelope;
});

const start = curry4("start", (stream, name, stats, envelope) => {
  stream.push({type: "plugin_start", ts: now(), plugin: name});
  stats.update(`pipeline.plugins.${name}`, merge({start: Date.now()}));
  return envelope;
});

const end = curry4("end", (stream, name, stats, envelope) => {
  const endTime = Date.now();
  const duration = endTime - stats.get(`pipeline.plugins.${name}.start`);
  // eslint-disable-next-line camelcase
  const total = filterData(({_sc_source}) => _sc_source === name, envelope).data
    .length;
  stream.push({type: "plugin_end", ts: now(), plugin: name});
  stats.update(
    `pipeline.plugins.${name}`,
    merge({end: endTime, duration, total}),
  );
  return envelope;
});

const mark = curry2("mark", (marker, envelope) =>
  fmapData(ds.concatOne({_sc_markers: [marker]}), envelope),
);

const dates = curry2("dates", (date, envelope) =>
  fmapData(ds.concatOne({_sc_pubdates: {pipeline: date}}), envelope),
);

const unitDefaults = fmapData(ds.concatOne(ds.emptyOne()));

const hashData = fmapData(ds.hashOne);

const source = curry2("source", (name, envelope) =>
  fmapData(ds.concatOne({_sc_source: name}), envelope),
);

/**
 * A runable sugarcube pipeline.
 * @typedef {Function} Runable
 * @property {string} marker The id of this run.
 * @property {stream} stream A BaconJS stream, which is used to communicate
 * between the progress of the sugarcube pipeline and caller of the
 * pipeline. It has the full BaconJS API available.
 */

/**
 * Create a runable sugarcube object.
 *
 * Construct a SugarCube pipeline. The pipeline is a function that can be
 * called without any arguments. It will return a promise that resolves to the
 * result of the pipeline run. The pipeline has a stream object is used to
 * receive messages during the pipeline run. It's currently mainly used for
 * logging purposes, but can be used for more as well.
 *
 * The stream sends messages with the following types:
 *
 * - `log_info`
 * - `log_debug`
 * - `log_error`
 * - `plugin_start`
 * - `plugin_end`
 *
 * The pipeline also exports an id, called a `marker`.
 *
 * @param {Object} config Configuration for a sugarcube run.
 * @param {Array.<String>} queryIds A list of ids to query.
 * @returns {Runable} A configured SugarCube run function.
 * @example
 * const run = runner(config, queryIds);
 *
 * run.stream.onValue(msg => {
 *   switch (msg.type) {
 *     case 'log_info': console.log(msg.msg); break;
 *     // ... other cases ...
 *     default: break;
 *   }
 * });
 *
 * run();
 */
const runner = curry3("runner", (plugins, cfg, queries) => {
  // FIXME: The signature of `runner` has to change to allow seed objects for
  //        cache. Using the `cfg` option is just a crutch.
  const stats =
    cfg.stats && cfg.stats.get && cfg.stats.update
      ? cfg.stats
      : state(cfg.stats);
  const cache =
    cfg.cache && cfg.cache.get && cfg.cache.update
      ? cfg.cache
      : state(cfg.cache);
  const seed = generateSeed(8);
  const timestamp = now();
  const stream = Bacon.Bus();
  const marker = uid(seed, timestamp);
  let endEarly = false;

  // The pipeline is a list of tuples, where the first element of the tuple
  // is a string indicating the name of the plugin, and the second element
  // is a function, that is the actual plugin.
  //     [['twitter_search', f1], ['mongodb_store', f2]]
  const pipeline = flow([map(p => plugins[p]), zip(cfg.plugins)])(cfg.plugins);

  stats.update(
    "pipeline",
    merge({
      plugins: pipeline.reduce(
        (memo, [p], order) => Object.assign(memo, {[p]: {order}}),
        {},
      ),
      name: cfg.name,
    }),
  );

  const log = {
    info: msg => stream.push({type: "log_info", msg}),
    warn: msg => stream.push({type: "log_warn", msg}),
    error: msg => stream.push({type: "log_error", msg}),
    debug: msg => stream.push({type: "log_debug", msg}),
  };

  const run = () =>
    flowP(
      [
        foldP((envelope, [name, plugin]) => {
          if (endEarly) return;
          // eslint-disable-next-line consistent-return
          return liftManyA2(
            [
              start(stream, name, stats),
              plugin,
              env => {
                endEarly = !!env.endEarly;
                return env;
              },
              unitDefaults,
              hashData,
              source(name),
              mark(marker),
              dates(timestamp),
              pluginStats(stream, name, stats),
              end(stream, name, stats),
            ],
            envelope,
            {plugins, cache, stats, log, cfg: merge({marker}, cfg)},
          );
        }, envelopeQueries(queries)),
        caughtP(e => stream.error(e)),
        tapP(() => stream.push({type: "stats", stats: stats.get()})),
        tapP(() => stream.end()),
      ],
      pipeline,
    );

  run.marker = marker;
  run.stream = stream;
  run.cache = cache;
  run.plugins = plugins;

  return run;
});

export default runner;
