import {includes} from "lodash/fp";
import {join} from "path";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {assertDir, wget} from "../utils";

const wgetTypes = ["url"];

const fetchPage = (envelope, {cfg, log}) =>
  env.fmapDataDownloadsAsync(d => {
    const {type, term, _lf_id_hash} = d;
    if (!includes(type, wgetTypes)) {
      return d;
    }
    const dir = join(cfg.http.download_dir, type, _lf_id_hash);
    const cmd = cfg.http.wget_cmd;

    return wget(cmd, dir, d)
      .tap(() => log.info(`Wget'ed ${term} to ${dir}.`))
      .catch(e => {
        // FIXME: Wget breaks a lot with error code 8.
        log.error(`Wget on ${term} failed with ${e}`);
        return d;
      });
  }, envelope);

const plugin = p.liftManyA2([assertDir, fetchPage]);

plugin.desc = "Fetch whole pages using wget.";

plugin.argv = {
  "http.wget_cmd": {
    type: "string",
    nargs: 1,
    default: "wget",
    desc: "The path to the wget command.",
  },
};

export default plugin;
