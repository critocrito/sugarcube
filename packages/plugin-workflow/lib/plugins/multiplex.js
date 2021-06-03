import {chunk, get} from "lodash/fp";
import {envelope as env, runner} from "@sugarcube/core";

const remainderPipeline = (plugins) => {
  const index = plugins.indexOf("workflow_multiplex");
  const endIndex = plugins.indexOf("workflow_multiplex_end");
  return endIndex === -1
    ? [plugins.slice(index + 1), []]
    : [plugins.slice(index + 1, endIndex), plugins.slice(endIndex)];
};

const plugin = async (envelope, {cfg, log, cache, stats, plugins, events}) => {
  const batchSize = get("workflow.multiplex_size", cfg);
  const continueOnError = get("workflow.multiplex_continue_on_error", cfg);

  const [pipeline, tailPipeline] = remainderPipeline(cfg.plugins);

  // Those queries should always be part of the pipeline, since plugins like
  // sheets_move_queries need them.
  const staticQueries = envelope.queries.filter(({type}) =>
    ["sheets_query"].includes(type),
  );
  const queryChunks = chunk(
    batchSize,
    envelope.queries.filter(({type}) => !["sheets_query"].includes(type)),
  );
  let abort = false;

  log.info(
    `Multiplexing ${pipeline.join(",")} into ${queryChunks.length} batches.`,
  );
  log.info(`Tailing the multiplexing by ${tailPipeline.join(",")}.`);

  await queryChunks.reduce((memo, queries, index) => {
    const batch = index + 1;
    const run = runner({
      plugins,
      cache,
      stats,
      config: {...cfg, plugins: pipeline},
      queries: queries.concat(staticQueries),
    });
    run.events.on("log", ({type, msg}) => {
      events.emit("log", {type, msg: `Batch ${batch}: ${msg}`});
    });
    run.events.on("error", (e) => {
      log.error(`Batch ${batch}: ${e.message}`);
      if (cfg.debug) log.error(e);
      if (!continueOnError) abort = true;
    });
    run.events.on("run", () => log.info(`Starting batch ${batch}.`));
    run.events.on("end", () => log.info(`Finished batch ${batch}.`));
    ["plugin_start", "plugin_end", "fail", "count", "duration"].forEach(
      (name) => run.events.on(name, (...args) => events.emit(name, ...args)),
    );

    return memo.then(async () => {
      // eslint-disable-next-line promise/always-return
      if (abort) return;
      await run();
    });
  }, Promise.resolve());

  log.info(`Finished all batches. Running the tail of the pipeline.`);

  if (tailPipeline.length === 0) return {endEarly: true, ...env.empty()};

  const run = runner({
    plugins,
    cache,
    stats,
    config: {...cfg, plugins: tailPipeline},
    queries: envelope.queries,
  });
  [
    "log",
    "plugin_start",
    "plugin_end",
    "error",
    "fail",
    "count",
    "duration",
  ].forEach((name) =>
    run.events.on(name, (...args) => events.emit(name, ...args)),
  );

  await run();

  return {endEarly: true, ...env.empty()};
};

plugin.argv = {
  "workflow.multiplex_size": {
    default: 1,
    nargs: 1,
    type: "number",
    desc: "The number of queries to batch the multiplexing.",
  },
  "workflow.multiplex_continue_on_error": {
    type: "boolean",
    desc: "Continue the multiplexing when a batch throws an error.",
  },
};

plugin.desc = "Multiplex the remainder of the pipeline in batches of queries.";

export default plugin;
