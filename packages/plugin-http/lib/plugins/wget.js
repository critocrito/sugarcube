import {merge, get, includes} from "lodash/fp";
import {flowP, tapP, collectP, caughtP} from "dashp";
import {join} from "path";
import {envelope as env, plugin as p} from "@sugarcube/core";

import {assertDir, wget} from "../utils";

const wgetTypes = ["url"];

const fetchPage = (envelope, {cfg, log}) => {
  const cmd = get("http.wget_cmd", cfg);
  const dataDir = get("http.data_dir", cfg);

  return env.fmapDataAsync(
    (unit) =>
      collectP((media) => {
        if (!includes(media.type, wgetTypes)) return media;

        const {type, term} = media;
        const idHash = media._sc_id_hash;
        const location = join(dataDir, unit._sc_id_hash, "wget", idHash);

        return flowP(
          [
            wget(cmd, location),
            () => unit._sc_downloads.push({location, type, term}),
            caughtP((e) =>
              // FIXME: Wget breaks a lot with error code 8.
              log.error(`Wget on ${term} failed with ${e}`),
            ),
            tapP(() => log.info(`Wget'ed ${term} to ${location}.`)),
            () => media,
          ],
          term,
        );
      }, unit._sc_media).then((ms) => merge(unit, {_sc_media: ms})),
    envelope,
  );
};

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
