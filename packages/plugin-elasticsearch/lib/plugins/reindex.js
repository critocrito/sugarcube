import {get, getOr} from "lodash/fp";
import fs from "fs";

import {Elastic} from "../elastic";

const reindexPlugin = (envelope, {log, cfg}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);
  const toHost = getOr(host, "elastic.to_host", cfg);
  const toPort = getOr(port, "elastic.to_port", cfg);
  const toIndex = get("elastic.to_index", cfg);
  const mappings = get("elastic.mappings", cfg)
    ? JSON.parse(fs.readFileSync(get("elastic.mappings", cfg)))
    : {};

  log.info(`Reindexing ${index} to http://${toHost}:${toPort}/${toIndex}`);

  return Elastic.Do(
    function* reindexIndex({reindex}) {
      yield reindex(index, host, port, toIndex);
    },
    {host: toHost, port: toPort, mappings},
  ).then(([, history]) => {
    history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
    return envelope;
  });
};

reindexPlugin.desc = "Reindex an an Elasticsearch index.";
reindexPlugin.argv = {
  "elastic.to_index": {
    type: "string",
    nargs: 1,
    desc: "Specify the new index name.",
  },
  "elastic.to_host": {
    type: "string",
    default: "localhost",
    nargs: 1,
    desc: "The hostname of the target Elasticsearch server.",
  },
  "elastic.to_port": {
    type: "string",
    default: "9200",
    nargs: 1,
    desc: "The port of the target Elasticsearch server.",
  },
  "elastic.mappings": {
    type: "string",
    nargs: 1,
    desc: "Load custom index mappings from a JSON file.",
  },
};

export default reindexPlugin;
