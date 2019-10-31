import {get, includes} from "lodash/fp";
import {collectP} from "dashp";
import url from "url";
import {join, basename, extname} from "path";
import {envelope as env, utils} from "@sugarcube/core";
import {
  mkdirP,
  sha256sum,
  md5sum,
  existsP,
  mvP,
  cleanUp,
} from "@sugarcube/plugin-fs";
import {counter} from "@sugarcube/utils";

import {download} from "../utils";

const {sToA} = utils;

const allowedTypes = ["video", "image", "document"];

const plugin = async (envelope, {log, cfg, stats}) => {
  const dataDir = get("media.data_dir", cfg);
  const getTypes = sToA(",", get("media.fetch_types", cfg)).filter(t =>
    allowedTypes.includes(t),
  );
  const force = get("media.force", cfg);

  if (getTypes.length === 0) {
    log.warn(
      `No valid types were defined to fetch. Possible types: ${allowedTypes.join(
        ", ",
      )}`,
    );
    return envelope;
  }

  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  return env.fmapDataAsync(async unit => {
    const downloads = await collectP(async media => {
      if (!includes(media.type, getTypes)) return null;

      stats.count("total");

      const {type, term, href} = media;
      const source = href || term;
      const idHash = media._sc_id_hash;

      // We maintain backwards compatibility with the old location where to
      // store files. If the new style location fails, try the old style
      // location as well. And only if that one fails as well download the
      // file to the new style location.
      //
      // Old style locations could look like this:
      //   - data/{unit_hash}/{type}/{media_hash}/{filename}
      //   - data/{unit_hash}/{type}/{media_hash}/{media_hash}.ext
      //
      // New style location is aligned with the handling of other types of
      // media.
      //   - data/{unit_hash}/{type}/{media_hash}.ext
      const dir = join(dataDir, unit._sc_id_hash, type);
      const oldDir = join(dataDir, unit._sc_id_hash, type, idHash);
      const newLocation = join(
        dir,
        `${idHash}${extname(url.parse(source).pathname)}`,
      );
      const oldLocation = join(
        oldDir,
        `${idHash}${extname(url.parse(source).pathname)}`,
      );
      const oldLocation2 = join(oldDir, basename(url.parse(source).pathname));

      let location = newLocation;
      let locationExists = false;

      try {
        const locations = [newLocation, oldLocation, oldLocation2];
        const locationsExists = await Promise.all(
          locations.map(l => existsP(l)),
        );
        for (let i = 0; i < locationsExists.length; i += 1) {
          if (locationsExists[i]) {
            locationExists = true;
            location = locations[i];
          }
        }
      } catch (e) {
        const reason = `Failed to access ${e.path}: ${e.message}.`;
        stats.fail({type: unit._sc_source, term: source, reason});
        return null;
      }

      if (locationExists && !force) {
        log.info(`Media ${source} exists at ${location}. Skipping.`);
        stats.count("existing");
        return null;
      }

      if (locationExists && force) {
        log.info(`Forcing a fetch for ${source}.`);
        stats.count("forced");
      }

      await mkdirP(dir);

      // Safely fetch the file. Remove any stale artefact if the download fails.
      try {
        await download(source, `${location}.tmp`);
        await mvP(`${location}.tmp`, location);
      } catch (e) {
        const reason = `Failed to download ${media.type} to ${location}: ${e.message}. Cleaning up stale artifact.`;
        stats.fail({type: unit._sc_source, term: source, reason});
        await cleanUp(`${location}.tmp`);

        return null;
      }

      const [md5, sha256] = await Promise.all([
        md5sum(location),
        sha256sum(location),
      ]);

      log.info(`Fetched ${source} to ${location}.`);
      stats.count("success");
      if (!locationExists) stats.count("new");

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

    logCounter();

    return Object.assign(unit, {
      _sc_downloads: unit._sc_downloads.concat(
        downloads.filter(d => d != null),
      ),
    });
  }, envelope);
};

// const plugin = p.liftManyA2([assertDir, curlGet]);

plugin.desc = "Fetch media files.";

plugin.argv = {
  "media.data_dir": {
    type: "string",
    nargs: 1,
    default: "data",
    desc: "The path to the download directory.",
  },
  "media.fetch_types": {
    type: "string",
    nargs: 1,
    default: "image,document",
    desc: "Fetch files of those media types.",
  },
  "media.force": {
    type: "boolean",
    desc: "Force to fetch a file.",
    default: false,
  },
};

export default plugin;
