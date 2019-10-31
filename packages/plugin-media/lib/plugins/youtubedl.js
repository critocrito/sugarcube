import {includes, get, constant} from "lodash/fp";
import dashp, {ofP, collectP, delayP} from "dashp";
import {join} from "path";
import {envelope as env} from "@sugarcube/core";
import {mkdirP, sha256sum, md5sum, existsP} from "@sugarcube/plugin-fs";
import {counter} from "@sugarcube/utils";
import isIp from "is-ip";

import {youtubeDl, random, cleanUp} from "../utils";

const downloadTypes = ["video"];

const plugin = async (envelope, {cfg, log, stats}) => {
  const dataDir = get("media.data_dir", cfg);
  const cmd = get("media.youtubedl_cmd", cfg);
  const videoFormat = get("media.download_format", cfg);
  const parallel = get("media.youtubedl_parallel", cfg);
  const forceDownload = get("media.youtubedl_force_download", cfg);
  const delaySeconds = get("media.youtubedl_delay", cfg);

  // Youtube-dl can either use the default route, or balance every invocation
  // of youtube-dl in a round-robin fashion over a list of ip-addresses.
  const sourceAddresses =
    get("media.youtubedl_source_addresses", cfg) == null
      ? []
      : get("media.youtubedl_source_addresses", cfg).filter(isIp);
  if (sourceAddresses.length > 0)
    log.debug(
      `Balancing youtube-dl over ${
        sourceAddresses.length
      } IP's: ${sourceAddresses.join(", ")}`,
    );
  const ipBalancer =
    sourceAddresses.length === 0
      ? constant(null)
      : () => {
          const elem = sourceAddresses.shift();
          sourceAddresses.push(elem);
          return elem;
        };

  let mod;
  switch (parallel) {
    case parallel < 1 ? parallel : null:
      log.warn(
        `--media.youtubedl_parallel must be between 1 and 8. Setting to 1.`,
      );
      mod = "";
      break;
    case parallel === 1 ? parallel : null:
      log.info(`Run a single download at a time.`);
      mod = "";
      break;
    case parallel > 8 ? parallel : null:
      log.warn(
        `--media.youtubedl_parallel must be between 1 and 8. Setting to 8.`,
      );
      mod = 8;
      break;
    default:
      log.info(`Run ${parallel} downloads concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];
  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  // ensure the download directory.
  await mkdirP(dataDir);

  const data = await mapper(async unit => {
    // Avoid live broadcasts, otherwise youtubedl gets "stuck".
    if (unit.snippet != null && unit.snippet.liveBroadcastContent === "live")
      return unit;

    const medias = await collectP(async media => {
      const {type, term, href} = media;
      const source = href || term;
      const idHash = media._sc_id_hash;

      if (!includes(type, downloadTypes)) return media;

      stats.count("total");

      const dir = join(dataDir, unit._sc_id_hash, "youtubedl");
      const location = join(dir, `${idHash}.${videoFormat}`);
      const downloadExists = await existsP(location);

      if (downloadExists && !forceDownload) {
        log.info(
          `Video ${source} exists at ${location}. Not forcing a download.`,
        );
        stats.count("existing");
        return media;
      }

      if (downloadExists && forceDownload)
        log.info(`Forcing a re-download of ${source}.`);

      if (delaySeconds > 0) {
        const randomDelay = random(delaySeconds, 2 * delaySeconds);
        log.debug(`Waiting ${randomDelay} seconds before fetching ${source}.`);
        await delayP(randomDelay * 1000, ofP());
      }

      // sourceAddress can either be a string containing an ip address or
      // null, which means to simply use the default host route.
      const sourceAddress = ipBalancer();
      if (sourceAddress !== null)
        log.debug(`Using ${sourceAddress} as source address.`);

      try {
        await youtubeDl(cmd, videoFormat, source, location, sourceAddress);
      } catch (e) {
        const reason = `Failed to download video: ${e.message}`;
        stats.fail({type: unit._sc_source, term: source, reason});

        // If we force a download and it fails, but the download exists
        // already, better to keep the old one around.
        if (downloadExists && !forceDownload) await cleanUp(location);

        return media;
      }

      log.info(`Downloaded ${source} to ${location}.`);
      stats.count("success");

      const [md5, sha256] = await Promise.all([
        md5sum(location),
        sha256sum(location),
      ]);
      unit._sc_downloads.push(
        Object.assign(
          {},
          {
            location,
            md5,
            sha256,
            type,
            term,
            href,
          },
          href ? {href} : {},
        ),
      );

      return media;
    }, unit._sc_media);

    logCounter();

    return Object.assign({}, unit, {_sc_media: medias});
  }, envelope.data);

  return env.envelope(data, envelope.queries);
};

plugin.desc = "Download videos using youtube-dl.";

plugin.argv = {
  "media.data_dir": {
    type: "string",
    nargs: 1,
    default: "data",
    desc: "The path to the download directory.",
  },
  "media.download_format": {
    type: "string",
    nargs: 1,
    default: "mp4",
    desc: "The download format of the video.",
  },
  "media.youtubedl_cmd": {
    type: "string",
    nargs: 1,
    default: "youtube-dl",
    desc: "The path to the youtube-dl command.",
  },
  "media.youtubedl_parallel": {
    type: "number",
    nargs: 1,
    desc:
      "Specify the number of parallel youtubedl downloads. Can be between 1 and 8.",
    default: 1,
  },
  "media.youtubedl_force_download": {
    type: "boolean",
    desc: "Force a redownload of the video.",
    default: false,
  },
  "media.youtubedl_delay": {
    type: "number",
    nargs: 1,
    desc: "Wait between N and 2xN seconds between invocations of youtube-dl.",
    default: 0,
  },
  "media.youtubedl_source_addresses": {
    type: "array",
    desc: "Round-Robin load balance youtube-dl's source ip addresses.",
  },
};

export default plugin;
