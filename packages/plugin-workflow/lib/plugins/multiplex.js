import {chunk, get} from "lodash/fp";
import {envelope as env, runner} from "@sugarcube/core";

const remainderPipeline = plugins => {
  const index = plugins.indexOf("workflow_multiplex");
  const endIndex = plugins.indexOf("workflow_multiplex_end");
  return endIndex === -1
    ? [plugins.slice(index + 1), []]
    : [plugins.slice(index + 1, endIndex), plugins.slice(endIndex + 1)];
};

const plugin = async (envelope, {cfg, log, cache, stats, plugins}) => {
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

  await queryChunks.reduce((memo, queries, index) => {
    const batch = index + 1;
    const run = runner(
      plugins,
      Object.assign({}, cfg, {cache, stats, plugins: pipeline}),
      queries.concat(staticQueries),
    );
    run.events.on("log", ({type, msg}) => {
      switch (type) {
        case "info":
          log.info(`Batch ${batch}: ${msg}`);
          break;
        case "warn":
          log.warn(`Batch ${batch}: ${msg}`);
          break;
        case "error":
          log.error(`Batch ${batch}: ${msg}`);
          break;
        case "debug":
          if (cfg.debug) log.debug(`Batch ${batch}: ${msg}`);
          break;
        default:
          break;
      }
    });
    run.events.on("plugin_start", ({plugin: p}) =>
      log.info(`Batch ${batch}: Starting the ${p} plugin.`),
    );
    run.events.on("plugin_end", ({plugin: p}) =>
      log.info(`Batch ${batch}: Finished the ${p} plugin.`),
    );
    run.events.on("error", e => {
      log.error(`Batch ${batch}: ${e.message}`);
      if (cfg.debug) log.error(e);
      if (!continueOnError) abort = true;
    });
    run.events.on("run", () => log.info(`Starting batch ${batch}.`));
    run.events.on("end", () => log.info(`Finished batch ${batch}.`));

    return memo.then(async () => {
      // eslint-disable-next-line promise/always-return
      if (abort) return;
      await run();
    });
  }, Promise.resolve());

  if (tailPipeline.length === 0)
    return Object.assign({endEarly: true}, env.empty());

  const run = runner(
    plugins,
    Object.assign({}, cfg, {cache, stats, plugins: tailPipeline}),
    envelope.queries,
  );
  run.events.on("log", ({type, msg}) => {
    switch (type) {
      case "info":
        log.info(msg);
        break;
      case "warn":
        log.warn(msg);
        break;
      case "error":
        log.error(msg);
        break;
      case "debug":
        if (cfg.debug) log.debug(msg);
        break;
      default:
        break;
    }
  });
  run.events.on("plugin_start", ({plugin: p}) =>
    log.info(`Starting the ${p} plugin.`),
  );
  run.events.on("plugin_end", ({plugin: p}) =>
    log.info(`Finished the ${p} plugin.`),
  );
  run.events.on("error", e => {
    log.error(e.message);
    if (cfg.debug) log.error(e);
  });

  await run();

  return Object.assign({endEarly: true}, env.empty());
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
