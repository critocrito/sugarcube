import {merge, get} from "lodash/fp";
import fs from "fs";
import path from "path";
import {envelope as env} from "@sugarcube/core";
import {mkdirP, md5sum, sha256sum} from "@sugarcube/plugin-fs";

const plugin = (envelope, {cfg, log}) => {
  const dataDir = get("tika.data_dir", cfg);

  return mkdirP(dataDir).then(() =>
    env.fmapDataAsync((unit) => {
      const medias = unit._sc_media.filter(
        (m) =>
          m.type !== "tika_location_text" || m.type !== "tika_location_meta",
      );
      if (medias.length === 0) return unit;

      const destDir = path.resolve(dataDir, unit._sc_id_hash);

      // eslint-disable-next-line promise/no-nesting
      return Promise.all(
        medias.map(({type, term, field}) => {
          const name = type === "tika_location_meta" ? "meta.json" : "text";
          const out =
            type === "tika_location_meta" ? JSON.stringify(term) : term;
          const target = path.resolve(destDir, field, `${name}`);

          log.debug(`Writing ${name} to ${target}.`);

          // eslint-disable-next-line promise/no-nesting
          return mkdirP(path.resolve(destDir, field || ""))
            .then(() => fs.writeFileSync(target, out))
            .then(() => Promise.all([md5sum(target), sha256sum(target)]))
            .then(([md5, sha256]) => ({
              location: target,
              md5,
              sha256,
              type,
            }));
        }),
      ).then((downloads) =>
        merge(unit, {
          _sc_downloads: unit._sc_downloads.concat(downloads),
        }),
      );
    }, envelope),
  );
};

plugin.desc = "Write tika extracted content to disk.";

plugin.argv = {
  "tika.data_dir": {
    type: "string",
    nargs: 1,
    default: "./data/tika_location",
    desc: "Store all tika files in this location.",
  },
};

export default plugin;
