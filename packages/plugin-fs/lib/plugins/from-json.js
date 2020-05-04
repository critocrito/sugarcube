import {flatmapP} from "dashp";
import {envelope as env} from "@sugarcube/core";
import fs from "fs";

import {unfold} from "../api";

const querySource = "glob_pattern";

const plugin = async (envelope, {log, stats}) => {
  const queries = env.queriesByType(querySource, envelope);

  const data = await flatmapP(async query => {
    const files = await unfold(query);

    if (files.length === 0) {
      log.warn(`Glob pattern ${query} failed to expand to any files.`);
      return [];
    }

    log.info(`Expanding glob pattern ${query} to ${files.length} files.`);

    return flatmapP(async ({location}) => {
      let units = [];

      try {
        const buffer = await fs.promises.readFile(location);
        units = JSON.parse(buffer);
      } catch (e) {
        log.error(`Failed to read ${location}: ${e.message}`);
        stats.fail({
          type: "fs_from_json",
          term: location,
          reason: e.message,
        });

        return [];
      }

      log.info(`Fetched ${units.length} units from ${location}`);
      stats.count("total", units.length);
      stats.count("success", units.length);

      return units;
    }, files);
  }, queries);

  log.info(
    `Fetched a total of ${data.length} units from ${queries.length} queries.`,
  );

  return env.concatData(data.filter(unit => unit != null), envelope);
};

plugin.argv = {};
plugin.desc = "Fetch data that is stored in JSON files.";

export default plugin;
