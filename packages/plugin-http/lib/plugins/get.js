import {get, includes} from "lodash/fp";
import {collectP} from "dashp";
import pify from "pify";
import fs from "fs";
import url from "url";
import {join, extname} from "path";
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

const curlGet = async (envelope, {log, cfg, stats}) => {
  const dataDir = get("http.data_dir", cfg);
  const getTypes = sToA(",", get("http.get_types", cfg));

  return env.fmapDataAsync(async unit => {
    const downloads = await collectP(async media => {
      if (!includes(media.type, getTypes)) return null;

      const {type, term, href} = media;
      const source = href || term;
      const idHash = media._sc_id_hash;

      // In the past we stored files in oldDir. To simplify we introduce the
      // new style location based on dir.
      const dir = join(dataDir, unit._sc_id_hash, type);
      const location = join(
        dir,
        `${idHash}${extname(url.parse(source).pathname)}`,
      );
      const oldDir = join(dataDir, unit._sc_id_hash, type, idHash);
      const oldLocation = join(
        oldDir,
        `${idHash}${extname(url.parse(source).pathname)}`,
      );

      // We maintain backwards compatibility with the old location where to
      // store files. If the new style location fails, try the old style
      // location as well. And only if that one fails as well download the
      // file to the new style location. By making sure to test the old style
      // location first we ensure to use the new style location in the failure
      // stat.
      try {
        try {
          await accessAsync(oldLocation);
          log.info(`Media ${source} exists at ${oldLocation}.`);
          return null;
        } catch (ee) {
          if (ee.code === "ENOENT") {
            await accessAsync(location);
            log.info(`Media ${source} exists at ${location}.`);
            return null;
          }
          throw ee;
        }
      } catch (e) {
        if (e.code !== "ENOENT") {
          const failed = {
            type: unit._sc_source,
            term: source,
            plugin: "http_get",
            reason: e.message,
          };
          stats.update("failed", fails =>
            Array.isArray(fails) ? fails.concat(failed) : [failed],
          );
          log.warn(
            `Failed to download ${media.type} ${source} to ${location}. Cleaning up stale artifact.`,
          );
          await cleanUp(location);
          return null;
        }
      }

      await mkdirP(dir);
      await download(source, location);
      const [md5, sha256] = await Promise.all([
        md5sum(location),
        sha256sum(location),
      ]);

      log.info(`Fetched ${source} to ${location}.`);

      return Object.assign(
        {},
        {
          location,
          md5,
          sha256,
          type,
          term,
        },
        href ? {href} : {},
      );
    }, unit._sc_media);

    return Object.assign(unit, {
      _sc_downloads: unit._sc_downloads.concat(
        downloads.filter(d => d != null),
      ),
    });
  }, envelope);
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
