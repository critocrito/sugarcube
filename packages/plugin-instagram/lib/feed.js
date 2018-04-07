import {get, size} from "lodash/fp";
import {Future as F, flow, flatmap, tap} from "dashp";
import {envelope as e} from "@sugarcube/core";

import {feed} from "./instagram";

const querySource = "instagram_user";

const plugin = (envelope, {log, cfg}) => {
  const queries = e.queriesByType(querySource, envelope);
  const postCount = get("instagram.post_count", cfg);

  log.debug(`Found ${size(queries)} queries.`);

  return flow(
    [
      flatmap(u =>
        flow([
          feed(postCount),
          tap(xs => log.info(`Fetched ${size(xs)} posts for ${u}'s feed.`)),
        ])(u),
      ),
      tap(rs => {
        const c = size(queries);
        log.info(`Fetched ${size(rs)} posts for ${c} feed${c > 1 ? "s" : ""}.`);
      }),
      F.map(rs => e.concatData(rs, envelope)),
    ],
    queries,
  );
};

plugin.desc = "Fetches posts from an Instagram feed.";

plugin.argv = {
  "instagram.post_count": {
    default: 100,
    nargs: 1,
    desc: "Number of posts to fetch.",
  },
};

export default plugin;
