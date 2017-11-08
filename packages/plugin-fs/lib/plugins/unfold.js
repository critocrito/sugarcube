import {size} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env} from "@sugarcube/core";
import {unfold} from "../api";

const querySource = "glob_pattern";

const plugin = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  return flowP(
    [
      flatmapP(unfold),
      tapP(rs =>
        log.info(`Expanded ${size(queries)} queries to ${size(rs)} paths.`)
      ),
      rs => env.concatData(rs, envelope),
    ],
    queries
  );
};

plugin.desc = "Expand glob patterns to files.";

plugin.argv = {};

export default plugin;
