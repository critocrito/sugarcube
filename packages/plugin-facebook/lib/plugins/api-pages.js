import {size, get} from "lodash/fp";
import {flowP, flatmapP} from "dashp";
import {envelope as e, plugin as p} from "@sugarcube/core";

import {fetchByAppToken, page} from "../api";
import {assertAppCredentials} from "../assertions";

const querySource = "facebook_page";

const apiPages = (envelope, {log, cfg}) => {
  const appId = get("facebook.app_id", cfg);
  const appSecret = get("facebook.app_secret", cfg);
  const queries = e.queriesByType(querySource, envelope);
  const fetcher = fetchByAppToken(appId, appSecret);

  log.debug(`Found ${size(queries)} queries.`);

  return flowP(
    [flatmapP(page(fetcher)), rs => e.concatData(rs, envelope)],
    queries
  );
};

const plugin = p.liftManyA2([assertAppCredentials, apiPages]);

plugin.desc = "Fetch pages.";
plugin.argv = {};

export default plugin;
