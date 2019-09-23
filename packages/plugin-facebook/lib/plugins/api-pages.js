import {size, get} from "lodash/fp";
import {flowP, flatmapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {fetchByAppToken, page} from "../api";
import {assertAppCredentials} from "../assertions";

const querySource = "facebook_page";

const apiPages = (envelope, {log, cfg, stats}) => {
  const appId = get("facebook.app_id", cfg);
  const appSecret = get("facebook.app_secret", cfg);
  const queries = env.queriesByType(querySource, envelope);
  const fetcher = fetchByAppToken(appId, appSecret);

  log.debug(`Found ${size(queries)} queries.`);

  const queryPage = async q => {
    let data = [];
    try {
      data = await page(fetcher, q);
    } catch (e) {
      stats.fail({type: querySource, term: q, reason: e.message});
    }
    return data;
  };

  return flowP(
    [flatmapP(queryPage), rs => env.concatData(rs, envelope)],
    queries,
  );
};

const plugin = p.liftManyA2([assertAppCredentials, apiPages]);

plugin.desc = "Fetch pages.";
plugin.argv = {};

export default plugin;
