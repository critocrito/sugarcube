import {get, includes} from "lodash/fp";
import {collectP} from "dashp";
import pify from "pify";
import fs from "fs";
import url from "url";
import {join, basename, extname} from "path";
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

const downloadExists = async location => {
  try {
    await accessAsync(location);
  } catch (e) {
    // telegram_channels use filenames that throw a ENAMETOOLONG.
    if (e.code === "ENOENT" || e.code === "ENAMETOOLONG") return false;
    throw e;
  }
  return true;
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

      // We maintain backwards compatibility with the old location where to
      // store files. If the new style location fails, try the old style
      // location as well. And only if that one fails as well download the
      // file to the new style location.
      //
      // Old style locations could look like this:
      //   - data/{unit_hash}/image/{media_hash}/{filename}
      //   - data/{unit_hash}/image/{media_hash}/{media_hash}.ext
      //
      // New style location is aligned with the handling of other types of
      // media.
      //   - data/{unit_hash}/image/{media_hash}.ext
      const dir = join(dataDir, unit._sc_id_hash, type);
      const oldDir = join(dataDir, unit._sc_id_hash, type, idHash);
      const location = join(
        dir,
        `${idHash}${extname(url.parse(source).pathname)}`,
      );
      const oldLocation = join(
        oldDir,
        `${idHash}${extname(url.parse(source).pathname)}`,
      );
      const oldLocation2 = join(oldDir, basename(url.parse(source).pathname));

      try {
        const locations = [location, oldLocation, oldLocation2];
        const locationsExists = await Promise.all(
          locations.map(l => downloadExists(l)),
        );
        for (let i = 0; i < locationsExists.length; i += 1) {
          if (locationsExists[i]) {
            log.info(`Media ${source} exists at ${locations[i]}.`);
            return null;
          }
        }
      } catch (e) {
        stats.fail({
          type: unit._sc_source,
          term: source,
          plugin: "http_get",
          reason: `Failed to access ${e.path}: ${e.message}.`,
        });
        return null;
      }

      await mkdirP(dir);

      let md5;
      let sha256;

      try {
        await download(source, location);
        [md5, sha256] = await Promise.all([
          md5sum(location),
          sha256sum(location),
        ]);
      } catch (e) {
        if (e.code !== "ENOENT") {
          stats.fail({
            type: unit._sc_source,
            term: source,
            plugin: "http_get",
            reason: `Failed to download ${media.type} to ${location}: ${e.message}. Cleaning up stale artifact.`,
          });
          await cleanUp(location);
          return null;
        }
      }

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
