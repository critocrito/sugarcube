import {merge, get, includes} from "lodash/fp";
import {flowP, tapP, collectP, caughtP} from "dashp";
import pify from "pify";
import fs from "fs";
import url from "url";
import {join, basename} from "path";
import {envelope as env, plugin as p, utils} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum} from "@sugarcube/plugin-fs";

import {assertDir, download} from "../utils";

const {sToA} = utils;
const accessAsync = pify(fs.access);
const unlinkAsync = pify(fs.unlink);

const cleanUp = async location => {
  try {
    await accessAsync(location);
    await unlinkAsync(location);
    // eslint-disable-next-line no-empty
  } catch (e) {}
};

const curlGet = (envelope, {log, cfg, stats}) => {
  const dataDir = get("http.data_dir", cfg);
  const getTypes = sToA(",", get("http.get_types", cfg));

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
            caughtP(async e => {
              const failed = {
                type: unit._sc_source,
                term: source,
                plugin: "http_get",
                reason: e.message,
              };
              stats.update(
                "failed",
                fails =>
                  Array.isArray(fails) ? fails.concat(failed) : [failed],
              );
              log.warn(
                `Failed to download ${
                  media.type
                } ${source} to ${location}. Cleaning up stale artifact.`,
              );
              await cleanUp(location);
            }),
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
    default: "image,file,pdf",
    desc: "Fetch files of those media types.",
  },
};

export default plugin;
