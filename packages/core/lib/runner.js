import {EventEmitter} from "events";
import {flow, map, zip, merge} from "lodash/fp";
import {flowP, caughtP, tapP, foldP} from "dashp";

import {liftManyA2} from "./data/plugin";
import {envelopeQueries, fmapData} from "./data/envelope";
import ds from "./data/data";
import {state} from "./state";
import {instrument} from "./instrument";
import {uid, generateSeed} from "./crypto";
import {now} from "./utils";

// The following functions provide pre and post-hooks for each plugin. The
// plugin runner composes them with the plugin.
const start = (events, plugin, stats, envelope) => {
  const ts = now();
  stats.pluginStart({plugin, ts});
  events.emit("log", {type: "info", msg: `Starting the ${plugin} plugin.`});
  events.emit("plugin_start", {plugin, ts});
  return envelope;
};

const end = (events, plugin, stats, marker, envelope) => {
  const ts = now();
  stats.pluginEnd({plugin, ts});
  events.emit("log", {type: "info", msg: `Finished the ${plugin} plugin.`});
  events.emit("plugin_end", {
    stats: stats.get(`plugins.${plugin}`),
    plugin,
    ts,
  });
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
 * @param {Object} opts Runner options.
 * @param {Object} opts.config Configuration for a sugarcube run.
 * @param {Array.<Plugin>} opts.plugins Plugins avaiable to the pipeline.
 * @param {Array.<Query>} opts.queries Queries for this pipeline run.
 * @param {Object} opts.stats A seed for collecting stats. Can be undefined.
 * @param {Object} opts.cache A cache from previous pipeline runs. Can be undefined.
 * @returns {Runable} A configured SugarCube run function.
 * @example
 * const run = runner(config, queryIds);
 *
 * run.events.on(({type, msg}) => {
 *   switch (type) {
 *     case 'info': console.log(msg); break;
 *     // ... other cases ...
 *     default: break;
 *   }
 * });
 *
 * run();
 */
const runner = opts => {
  const {plugins, config, queries, stats: runStats, cache: runCache} = opts;

  const events = new EventEmitter();
  const ts = now();
  const seed = generateSeed(8);
  const marker = uid(seed, ts);
  const stats = instrument(runStats, {events});
  const cache = state(runCache);
  let endEarly = false;

  // The pipeline is a list of tuples, where the first element of the tuple
  // is a string indicating the name of the plugin, and the second element
  // is a function, that is the actual plugin.
  //     [['twitter_search', f1], ['mongodb_store', f2]]
  const pipeline = flow([map(p => plugins[p]), zip(config.plugins)])(
    config.plugins,
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
        tapP(() => {
          stats.pipelineStart({
            project: config.project,
            name: config.name,
            ts,
            pipeline,
            marker,
          });
          events.emit("run", {marker});
        }),
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
              e => mangleData(name, marker, ts, e),
              e => end(events, name, stats, marker, e),
            ],
            envelope,
            {plugins, cache, stats, log, cfg: merge({marker}, config), events},
          );
        }, envelopeQueries(queries)),
        caughtP(e => events.emit("error", e)),
        tapP(() => {
          stats.pipelineEnd({ts: now()});
          events.emit("stats", {stats: stats.get()});
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
};

export default runner;
