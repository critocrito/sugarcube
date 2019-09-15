import {EventEmitter} from "events";
import {flow, map, zip, merge} from "lodash/fp";
import {flowP, caughtP, tapP, foldP} from "dashp";

import {liftManyA2} from "./data/plugin";
import {envelopeQueries, fmapData, filterData} from "./data/envelope";
import ds from "./data/data";
import {state} from "./state";
import {instrument} from "./instrument";
import {uid, generateSeed} from "./crypto";
import {now, curry3} from "./utils";

// The following functions provide funtionalities that should be run every
// time a plugin is run. The plugin runner composes them with the plugin.
const pluginStats = (events, name, stats, envelope) => {
  events.emit("plugin_stats", {type: "plugin_stats", plugin: name});
  return envelope;
};

const start = (events, name, stats, envelope) => {
  const epoch = Date.now();
  events.emit("plugin_start", {type: "plugin_start", ts: now(), plugin: name});
  stats.update(`pipeline.plugins.${name}`, st =>
    Object.assign({}, st, {
      start: Array.isArray(st.start) ? st.start.concat(epoch) : [epoch],
    }),
  );
  return envelope;
};

const end = (events, name, stats, envelope) => {
  const epoch = Date.now();
  const duration =
    epoch - stats.get(`pipeline.plugins.${name}.start`).slice(-1)[0];
  // eslint-disable-next-line camelcase
  const total = filterData(({_sc_source}) => _sc_source === name, envelope).data
    .length;
  events.emit("plugin_end", {type: "plugin_end", ts: now(), plugin: name});
  stats.update(`pipeline.plugins.${name}`, st =>
    Object.assign({}, st, {
      total: Array.isArray(st.total) ? st.total.concat(total) : [total],
      end: Array.isArray(st.end) ? st.end.concat(epoch) : [epoch],
      duration: Array.isArray(st.duration)
        ? st.duration.concat(duration)
        : [duration],
    }),
  );
  return envelope;
};

const mangleData = (source, marker, date, envelope) =>
  fmapData(unit => {
    const toMerge = Object.assign(
      ds.hashOne(Object.assign(ds.emptyOne(), unit)),
      {
        _sc_source: source,
        _sc_pubdates: {fetch: date},
        _sc_markers: [marker],
      },
    );
    return ds.concatOne(toMerge, unit);
  }, envelope);

/**
 * A runable sugarcube pipeline.
 * @typedef {Function} Runable
 * @property {string} marker The id of this run.
 * @property {events} EventEmitter A NodeJS EventEmitter, which is used to communicate
 * between the progress of the sugarcube pipeline and caller of the
 * pipeline.
 */

/**
 * Create a runable sugarcube object.
 *
 * Construct a SugarCube pipeline. The pipeline is a function that can be
 * called without any arguments. It will return a promise that resolves to the
 * result of the pipeline run. The pipeline has a events object is used to
 * receive messages during the pipeline run. It's currently mainly used for
 * logging purposes, but can be used for more as well.
 *
 * The following events are emitted:
 *
 * - `log`
 * - `plugin_start`
 * - `plugin_end`
 * - `stats`
 *
 * The pipeline also exports an id, called a `marker`.
 *
 * @param {Object} config Configuration for a sugarcube run.
 * @param {Array.<String>} queryIds A list of ids to query.
 * @returns {Runable} A configured SugarCube run function.
 * @example
 * const run = runner(config, queryIds);
 *
 * run.events.onValue(msg => {
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
  const stats = instrument(cfg.stats);
  const cache = state(cfg.cache);
  const seed = generateSeed(8);
  const timestamp = now();
  const events = new EventEmitter();
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
    info: msg => events.emit("log", {type: "info", msg}),
    warn: msg => events.emit("log", {type: "warn", msg}),
    error: msg => events.emit("log", {type: "error", msg}),
    debug: msg => events.emit("log", {type: "debug", msg}),
  };

  const run = () =>
    flowP(
      [
        tapP(() => events.emit("run", {marker})),
        foldP((envelope, [name, plugin]) => {
          if (endEarly) return;
          // eslint-disable-next-line consistent-return
          return liftManyA2(
            [
              e => start(events, name, stats, e),
              plugin,
              e => {
                endEarly = !!e.endEarly;
                return e;
              },
              e => mangleData(name, marker, timestamp, e),
              e => pluginStats(events, name, stats, e),
              e => end(events, name, stats, e),
            ],
            envelope,
            {plugins, cache, stats, log, cfg: merge({marker}, cfg)},
          );
        }, envelopeQueries(queries)),
        caughtP(e => events.emit("error", e)),
        tapP(() => {
          events.emit("stats", {type: "stats", stats: stats.get()});
          events.emit("end");
        }),
      ],
      pipeline,
    );

  run.marker = marker;
  run.events = events;
  run.cache = cache;
  run.plugins = plugins;

  return run;
});

export default runner;
