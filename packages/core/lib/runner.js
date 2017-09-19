import {
  flow,
  curry,
  map,
  zip,
  merge,
  join,
  keys,
  size,
  difference,
  isEmpty,
} from "lodash/fp";
import Bacon from "baconjs";
import {generate as shortId} from "shortid";

import {liftManyA2} from "./data/plugin";
import {envelopeQueries, fmapData} from "./data/envelope";
import ds from "./data/data";
import {now} from "./utils";
import {list, load} from "./utils/plugins";
import {reduceP} from "./utils/combinators";

// The following functions provide funtionalities that should be run every
// time a plugin is run. The plugin runner composes them with the plugin.
const stats = curry((stream, name, envelope) => {
  stream.push({type: "plugin_stats", plugin: name, size: size(envelope.data)});
  return envelope;
});

const start = curry((stream, name, envelope) => {
  stream.push({type: "plugin_start", ts: now(), plugin: name});
  return envelope;
});

const end = curry((stream, name, envelope) => {
  stream.push({type: "plugin_end", ts: now(), plugin: name});
  return envelope;
});

const mark = curry((marker, envelope) =>
  fmapData(ds.concatOne({_lf_markers: [marker]}), envelope)
);

const unitDefaults = fmapData(ds.concatOne(ds.emptyOne()));

const hashData = fmapData(ds.hashOne);

const source = curry((name, envelope) =>
  fmapData(ds.concatOne({_lf_source: name}), envelope)
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
const runner = curry((cfg, queries) => {
  const [plugins, missing] = flow([list, load])();
  const stream = Bacon.Bus();
  const marker = shortId();

  // Check that all dependencies are installed.
  if (!isEmpty(missing)) {
    const msg = `Missing the following modules: ${join(", ", missing)}`;
    throw new Error(msg);
  }

  // Make sure we have all requested plugins.
  const missingPlugins = flow([keys, difference(cfg.plugins)])(plugins);
  if (!isEmpty(missingPlugins)) {
    const msg = `Missing the following plugins: ${join(", ", missingPlugins)}`;
    throw new Error(msg);
  }

  // The pipeline is a list of tuples, where the first element of the tuple
  // is a string indicating the name of the plugin, and the second element
  // is a function, that is the actual plugin.
  //     [['twitter_search', f1], ['mongodb_store', f2]]
  const pipeline = flow([map(p => plugins[p]), zip(cfg.plugins)])(cfg.plugins);

  const log = {
    info: msg => stream.push({type: "log_info", msg}),
    error: msg => stream.push({type: "log_error", msg}),
    debug: msg => stream.push({type: "log_debug", msg}),
  };

  const run = () =>
    // Iterate over the pipeline and run each transformation in sequence.
    reduceP(
      (envelope, [name, plugin]) =>
        liftManyA2(
          [
            start(stream, name),
            plugin,
            unitDefaults,
            hashData,
            source(name),
            mark(marker),
            stats(stream, name),
            end(stream, name),
          ],
          envelope,
          {log, cfg: merge({marker}, cfg)}
        ),
      envelopeQueries(queries),
      pipeline
    )
      .catch(e => stream.error(e))
      .tap(() => stream.end());

  run.marker = marker;
  run.stream = stream;

  return run;
});

export default runner;
