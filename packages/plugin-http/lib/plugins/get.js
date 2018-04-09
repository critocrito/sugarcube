import {merge, get, includes} from "lodash/fp";
import {flowP, tapP, collectP} from "dashp";
import pify from "pify";
import fs from "fs";
import url from "url";
import {join, basename} from "path";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum} from "@sugarcube/plugin-fs";

import {assertDir, download} from "../utils";

const accessAsync = pify(fs.access);

const curlGet = (envelope, {log, cfg}) => {
  const dataDir = get("http.data_dir", cfg);
  const getTypes = get("http.get_types", cfg).split(",");

  return env.fmapDataAsync(
    unit =>
      collectP(media => {
        if (!includes(media.type, getTypes)) return media;

        const {type, term, href} = media;
        const source = href || term;
        const idHash = media._sc_id_hash;
        const dir = join(dataDir, unit._sc_id_hash, type, idHash);
        const location = join(dir, basename(url.parse(source).pathname));

        return flowP(
          [
            () =>
              accessAsync(location)
                .then(() =>
                  log.info(`Media at ${source} exists at ${location}`),
                )
                .catch(e => {
                  if (e.code === "ENOENT") {
                    return flowP(
                      [
                        () => mkdirP(dir),
                        () => download(source, location),
                        tapP(() =>
                          log.info(`Fetched ${source} to ${location}.`),
                        ),
                      ],
                      null,
                    );
                  }
                  throw e;
                }),
            () => Promise.all([md5sum(location), sha256sum(location)]),
            tapP(([md5, sha256]) =>
              unit._sc_downloads.push(
                Object.assign(
                  {},
                  {
                    dir,
                    md5,
                    sha256,
                    type,
                    term,
                  },
                  href ? {href} : {},
                ),
              ),
            ),
            () => media,
          ],
          null,
        );
      }, unit._sc_media).then(ms => merge(unit, {_sc_media: ms})),
    envelope,
  );
};

const plugin = p.liftManyA2([assertDir, curlGet]);

plugin.desc = "Fetch images from the web.";

plugin.argv = {
  "http.get_types": {
    type: "string",
    nargs: 1,
    default: "image,file,pdf,video",
    desc: "Fetch files of those media types.",
  },
};

export default plugin;
