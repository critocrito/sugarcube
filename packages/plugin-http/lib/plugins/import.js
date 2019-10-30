import fetch from "node-fetch";
import contentType from "content-type";
import {flowP, collectP} from "dashp";
import {envelope as env} from "@sugarcube/core";

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

        const unit = {
          _sc_id_fields: ["location"],
          _sc_media: [{type: mediaType, term: url}],
          _sc_queries: [{type: querySource, term: url}],
          location: url,
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
