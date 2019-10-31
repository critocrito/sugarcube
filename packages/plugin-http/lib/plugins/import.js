import fetch from "node-fetch";
import contentType from "content-type";
import {flowP, collectP} from "dashp";
import {envelope as env} from "@sugarcube/core";
import {extract} from "@sugarcube/utils";

import {
  getAuthor,
  getTitle,
  getDescription,
  getLanguage,
  getCreated,
} from "../utils";

const querySource = "http_url";

const urlContentType = async url => {
  const resp = await fetch(url, {method: "HEAD"});
  if (!resp.ok) {
    throw new Error(`${resp.status}: ${resp.statusText}`);
  }
  const header = resp.headers.get("Content-Type");
  const {type} = contentType.parse(header);

  if (type.startsWith("text")) return "url";
  if (type.startsWith("image")) return "image";
  if (type.startsWith("video")) return "video";
  return "document";
};

const plugin = async (envelope, {log, stats}) => {
  const queries = env.queriesByType(querySource, envelope);

  const data = await flowP(
    [
      collectP(async url => {
        stats.count("total");

        let mediaType;
        try {
          mediaType = await urlContentType(url);
        } catch (e) {
          stats.fail({type: "http_import", term: url, reason: e.message});
          return null;
        }

        let contents = {text: null, meta: {}};
        if (!["video"].includes(mediaType))
          try {
            contents = await extract(url);
          } catch (e) {
            stats.fail({type: "http_import", term: url, reason: e.message});
            return null;
          }
        const {text, meta} = contents;

        const unitData = {
          body: text.trim(),
          author: getAuthor(meta),
          title: getTitle(meta),
          description: getDescription(meta),
          language: getLanguage(meta),
          created: getCreated(meta),
        };

        const pubdates =
          unitData.created == null ? {} : {source: unitData.created};

        const unit = {
          _sc_id_fields: ["location"],
          _sc_media: [{type: mediaType, term: url}],
          _sc_queries: [{type: querySource, term: url}],
          _sc_pubdates: pubdates,
          location: url,
          // Fields that couldn't be extracted are not added to the unit.
          ...Object.keys(unitData).reduce((memo, key) => {
            if (unitData[key] == null) return memo;
            return Object.assign(memo, {[key]: unitData[key]});
          }, {}),
        };

        log.info(`Imported ${url} as media type "${mediaType}".`);
        stats.count("success");

        return unit;
      }),
      rs => rs.filter(r => r !== null),
    ],
    queries,
  );

  return env.concatData(data, envelope);
};

plugin.argv = {};
plugin.desc = "Import HTTP URI's as Sugarcube units.";

export default plugin;
