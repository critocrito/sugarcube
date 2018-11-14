import {chunk, get} from "lodash/fp";
import {envelope as env, runner} from "@sugarcube/core";

const remainderPipeline = plugins => {
  const index = plugins.indexOf("workflow_multiplex");
  return plugins.slice(index + 1);
};

const plugin = async (envelope, {cfg, log, cache, stats, plugins}) => {
  const batchSize = get("workflow.multiplex_size", cfg);
  const continueOnError = get("workflow.multiplex_continue_on_error", cfg);

  const pipeline = remainderPipeline(cfg.plugins);
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
    run.stream.onValue(msg => {
      switch (msg.type) {
        case "log_info":
          log.info(`Batch ${batch}: ${msg.msg}`);
          break;
        case "log_warn":
          log.warn(`Batch ${batch}: ${msg.msg}`);
          break;
        case "log_error":
          log.error(`Batch ${batch}: ${msg.msg}`);
          break;
        case "log_debug":
          if (cfg.debug) log.debug(`Batch ${batch}: ${msg.msg}`);
          break;
        case "plugin_start":
          log.info(`Batch ${batch}: Starting the ${msg.plugin} plugin.`);
          break;
        case "plugin_end":
          log.info(`Batch ${batch}: Finished the ${msg.plugin} plugin.`);
          break;
        default:
          break;
      }
    });
    run.stream.onError(e => {
      log.error(`Batch ${batch}: ${e.message}`);
      if (cfg.debug) log.error(e);
      if (!continueOnError) abort = true;
    });

    return memo.then(async () => {
      // eslint-disable-next-line promise/always-return
      if (abort) return;
      log.info(`Starting the batch ${batch}.`);
      await run();
      log.info(`Finished the batch ${batch}.`);
    });
  }, Promise.resolve());

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
