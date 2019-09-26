import {get, chunk} from "lodash/fp";
import {flatmapP, flowP, tapP, delayP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";
import {videosListCheck} from "../api";
import {assertCredentials, parseVideoQuery} from "../utils";

const checkAndFilterVideos = async (envelope, {cfg, log, stats}) => {
  const key = get("youtube.api_key", cfg);

  let counter = 0;

  log.info(`Checking ${envelope.data.length} videos.`);

  const videos = await flatmapP(
    flowP([
      tapP(units => {
        stats.count("total", units.length);
        log.info(`Fetch details for ${units.length} videos.`);
        counter += units.length;
        if (counter % 1000 === 0)
          log.debug(
            `Fetched ${counter} out of ${envelope.data.length} videos.`,
          );
      }),
      async units => {
        const ids = units.reduce(
          (memo, unit) =>
            memo.concat(
              unit._sc_media
                .filter(({type}) => type === "video")
                .map(({term}) => parseVideoQuery(term)),
            ),
          [],
        );

        const results = await videosListCheck(key, ids);

        const missing = [];

        if (results.length !== units.length) {
          units.forEach(unit => {
            unit._sc_media
              .filter(({type}) => type === "video")
              .forEach(({term}) => {
                const i = parseVideoQuery(term);
                if (results.find(({id}) => id === i) == null)
                  missing.push(unit);
              });
          });
        }

        stats.count("fail", missing.length);
        stats.count("existing", units.length - missing.length);

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
