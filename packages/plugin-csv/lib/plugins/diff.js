import {map, merge, get, pick} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env, data as d, plugin as p, utils} from "@sugarcube/core";
import {unfold} from "@sugarcube/plugin-fs";

import {parseMany} from "../parse";
import {assertIdFields} from "../assertions";

const {sToA} = utils;
const querySource = "diff_glob_pattern";

const diffPlugin = (envelope, {cfg, log, stats}) => {
  const patterns = env.queriesByType(querySource, envelope);
  const delimiter = get("csv.delimiter", cfg);
  const idFields = sToA(",", get("csv.id_fields", cfg));

  const entity = merge(d.emptyOne(), {_sc_id_fields: idFields});

  return flowP(
    [
      // The order of the merge matters, otherwise the id_fields are merged badly.
      flatmapP(pattern => unfold(pattern).then(map(u => merge(u, entity)))),
      tapP(fs => log.info(`Diffing data from ${fs.length} files.`)),
      parseMany(delimiter),
      tapP(xs =>
        log.info(
          `Diffing ${xs.length} from CSV with ${envelope.data.length} from envelope.`,
        ),
      ),
      xs => {
        const toDiff = env.envelopeData(xs);

        const added = env.difference(envelope, toDiff);
        const removed = env.difference(toDiff, envelope);
        const shared = env.intersection(toDiff, envelope);

        const strip = map(u =>
          pick(u._sc_id_fields.concat(["_sc_id_hash"]), u),
        );

        const diff = {
          added: {count: added.data.length, units: strip(added.data)},
          removed: {count: removed.data.length, units: strip(removed.data)},
          shared: {count: shared.data.length},
          meta: {count: toDiff.data.length, pipeline: cfg.plugins.join(",")},
        };

        stats.update("diff", merge(diff));

        log.info(`${added.data.length} units added.`);
        log.info(`${removed.data.length} units removed.`);
        log.info(`${shared.data.length} units shared.`);
        log.info(
          `Diffing: ${diff.meta.count}/${envelope.data.length} (${diff.meta.pipeline}).`,
        );

        return envelope;
      },
    ],
    patterns,
  );
};

const plugin = p.liftManyA2([assertIdFields, diffPlugin]);

plugin.desc = "Import CSV files and diff with the current envelope.";

export default plugin;
