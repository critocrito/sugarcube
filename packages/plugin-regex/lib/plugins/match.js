import {flow, map, merge, join, get, isEmpty, isArray} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

const queryType = "regex_pattern";

const plugin = (envelope, {log, cfg}) => {
  const field = get("regex.field", cfg);
  const queries = env.queriesByType(queryType, envelope);

  if (isEmpty(queries)) return envelope;

  const query = flow([
    map(q => `((\\w+\\s*)?(\\w+\\s*)?${q}(\\s*\\w+)?(\\s*\\w+)?)`),
    join("|"),
    r => new RegExp(r, "gi"),
  ])(queries);

  log.info(`Matching: ${query}`);

  return env.fmapData(unit => {
    if (!unit[field]) return unit;

    const matches = (unit[field] || "").match(query);

    const scRegex = {
      _sc_regex: {
        matched: isArray(matches),
        count: matches ? matches.length : 0,
        context: join(" ... ", matches),
        query,
        field,
      },
    };

    return merge(unit, scRegex);
  }, envelope);
};

plugin.desc = "Match regular expressions.";

plugin.argv = {
  "regex.field": {
    nargs: 1,
    desc: "The field name to search for a match.",
  },
};

export default plugin;
