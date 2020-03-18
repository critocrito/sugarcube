import {get, chunk} from "lodash/fp";
import {flatmapP, flowP, delayP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {counter} from "@sugarcube/utils";

import {videosListCheck} from "../api";
import {assertCredentials, parseYoutubeVideo} from "../utils";

const checkAndFilterVideos = async (envelope, {cfg, log, stats}) => {
  const key = get("youtube.api_key", cfg);

  const logCounter = counter(
    envelope.data.length,
    ({cnt, total, percent}) =>
      log.debug(`Progress: ${cnt}/${total} units (${percent}%).`),
    {threshold: 50, steps: 25},
  );

  log.info(`Checking ${envelope.data.length} videos.`);

  const videos = await flatmapP(
    flowP([
      async units => {
        stats.count("total", units.length);

        const ids = units.reduce(
          (memo, unit) =>
            memo.concat(
              unit._sc_media
                .filter(({type}) => type === "video")
                .map(({term}) => parseYoutubeVideo(term)),
            ),
          [],
        );

        const missing = [];
        const errors = [];
        let results = [];
        let isError = false;
        let failMsg = "Doesn't exist.";

        try {
          results = await videosListCheck(key, ids);
        } catch (e) {
          isError = true;
          failMsg = e.message;
        }

        if (results.length !== units.length) {
          units.forEach(unit => {
            unit._sc_media
              .filter(({type}) => type === "video")
              .forEach(({term}) => {
                const i = parseYoutubeVideo(term);

                if (results.find(({id}) => id === i) == null) {
                  if (isError) {
                    errors.push(unit);
                  } else {
                    missing.push(unit);
                  }
                  stats.fail({
                    type: "youtube_video",
                    reason: failMsg,
                    term,
                  });
                }
              });
          });

          units.forEach(logCounter);
        }

        stats.count("existing", units.length - missing.length - errors.length);
        stats.count("missing", missing.length);
        log.info(
          `Fetch details for ${units.length} videos: ${missing.length} failed.`,
        );

        return missing;
      },
      delayP(500),
    ]),
    chunk(50, envelope.data),
  );

  return env.envelopeData(videos);
};

const plugin = p.liftManyA2([assertCredentials, checkAndFilterVideos]);

plugin.desc =
  "Check failing videos and remove existing videos from the pipeline.";
plugin.argv = {};

export default plugin;
