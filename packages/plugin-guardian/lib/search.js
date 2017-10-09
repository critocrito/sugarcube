import {curry, merge, property, size} from "lodash/fp";
import {flowP, flatmapP, collectP, tapP} from "combinators-p";
import Promise from "bluebird";
import request from "request";
import moment from "moment";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {assertKey} from "./utils";

Promise.promisifyAll(request);

const searchGuardian = curry((key, term) => {
  const opts = {
    uri: "https://content.guardianapis.com/search",
    qs: {"api-key": key, q: term},
    json: true,
  };

  return request.getAsync(opts).then(property("body.response.results"));
});

const content = (envelope, {log, cfg}) => {
  const {key} = cfg.guardian;
  const queries = env.queriesByType("guardian_search", envelope);

  const search = term =>
    flowP(
      [
        searchGuardian(key),
        tapP(rs =>
          log.info(`Fetched ${size(rs)} pieces of content for ${term}.`)
        ),
      ],
      term
    );

  return flowP(
    [
      flatmapP(search),
      collectP(r => {
        const unit = {
          _sc_source: "guardian_content",
          _sc_id_fields: ["id"],
          _sc_content_fields: ["webTitle", "webUrl"],
          _sc_pubdates: {source: moment.utc(r.webPublicationDate).toDate()},
          _sc_links: [
            {type: "url", href: r.webUrl},
            {type: "self", href: r.apiUrl},
          ],
          _sc_relations: [
            {type: "url", term: r.webUrl},
            {type: "url", term: r.apiUrl},
          ],
          _sc_downloads: [
            {type: "url", term: r.webUrl},
            {type: "json", term: r.apiUrl},
          ],
        };
        return merge(r, unit);
      }),
      rs => env.concatData(rs, envelope),
    ],
    queries
  );
};

const plugin = p.liftManyA2([assertKey, content]);

plugin.description = "Search for content of The Guardian.";

export default plugin;
