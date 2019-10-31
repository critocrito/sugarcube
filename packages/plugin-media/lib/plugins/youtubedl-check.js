import {get, constant} from "lodash/fp";
import dashp, {ofP, collectP, delayP} from "dashp";
import isIp from "is-ip";
import {counter} from "@sugarcube/utils";

import {youtubeDlCheck, random} from "../utils";

const plugin = async (envelope, {log, cfg, stats}) => {
  const cmd = get("media.youtubedl_cmd", cfg);
  const parallel = get("media.youtubedl_parallel", cfg);
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
      log.info(`Run ${parallel} checks concurrently.`);
      mod = parallel;
  }

  const mapper = dashp[`flatmapP${mod}`];
  const logCounter = counter(envelope.data.length, ({cnt, total, percent}) =>
    log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
  );

  await mapper(async unit => {
    const videos = unit._sc_media
      .filter(({type}) => type === "video")
      .map(({term}) => term);

    await collectP(async url => {
      stats.count("total");

      if (delaySeconds > 0) {
        const randomDelay = random(delaySeconds, 2 * delaySeconds);
        log.debug(`Waiting ${randomDelay} seconds before fetching ${url}.`);
        await delayP(randomDelay * 1000, ofP());
      }

      // sourceAddress can either be a string containing an ip address or
      // null, which means to simply use the default host route.
      const sourceAddress = ipBalancer();
      if (sourceAddress !== null)
        log.debug(`Using ${sourceAddress} as source address.`);

      try {
        await youtubeDlCheck(cmd, url, sourceAddress);
      } catch (e) {
        const reason = `Check failed: ${e.message}`;
        stats.fail({type: unit._sc_source, term: url, reason});
      }

      stats.count("success");
    }, videos);

    logCounter();
  }, envelope.data);

  return envelope;
};

plugin.desc = "Check the availability of a video.";

plugin.argv = {
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
