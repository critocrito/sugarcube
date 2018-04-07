import {size, get} from "lodash/fp";
import {flowP, flatmapP, caughtP, tapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {fetchByAppToken, feed} from "../api";
import {assertAppCredentials} from "../assertions";

const querySource = "facebook_page";

const apiFeed = (envelope, {cfg, log}) => {
  const appId = get("facebook.app_id", cfg);
  const appSecret = get("facebook.app_secret", cfg);
  const limit = get("facebook.feed_limit", cfg);
  const queries = env.queriesByType(querySource, envelope);
  const fetcher = fetchByAppToken(appId, appSecret);

  log.debug(`Found ${size(queries)} queries.`);

  const query = id => {
    log.info(`Querying the feed of ${id}.`);
    return flowP(
      [
        feed(limit, fetcher),
        tapP(ms => log.info(`Fetched ${size(ms)} messages for ${id}.`)),
        caughtP(err => {
          if (err.statusCode === 404) {
            const msg = get("error.error.message", err);
            log.warn(msg);
            return [];
          }
          throw err;
        }),
      ],
      id,
    );
  };

  return flowP([flatmapP(query), rs => env.concatData(rs, envelope)], queries);
};

const plugin = p.liftManyA2([assertAppCredentials, apiFeed]);

plugin.argv = {
  "facebook.feed_limit": {
    type: "number",
    default: 0,
    nargs: 1,
    desc:
      "Limit the number of feed messages. Setting it to 0 removes the limit.",
  },
};

plugin.desc = "Fetch the feed of a page.";

export default plugin;
