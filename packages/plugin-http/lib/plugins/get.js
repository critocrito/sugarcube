import {includes} from "lodash/fp";
import {flowP, tapP} from "dashp";
import {join} from "path";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {assertDir, download} from "../utils";

const getTypes = ["image", "file", "pdf", "video"];

const curlGet = (envelope, {log, cfg}) =>
  env.fmapDataDownloadsAsync(d => {
    const {type, term, _sc_id_hash} = d;
    if (!includes(type, getTypes)) {
      return d;
    }
    const dir = join(cfg.http.download_dir, type, _sc_id_hash);

    return flowP(
      [download(dir), tapP(() => log.info(`Fetched ${term} to ${dir}.`))],
      d
    );
  }, envelope);

const plugin = p.liftManyA2([assertDir, curlGet]);

plugin.desc = "Fetch images from the web.";

export default plugin;
