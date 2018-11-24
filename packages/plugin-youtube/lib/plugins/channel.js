import {size, get, pickBy, identity, filter} from "lodash/fp";
import {flowP, tapP} from "dashp";
import {plugin as p, envelope as env} from "@sugarcube/core";
import moment from "moment";

import {Counter, assertCredentials, parseChannelQuery} from "../utils";
import {videoChannelPlaylist, videoChannel} from "../api";

const querySource = "youtube_channel";

const listChannel = (envelope, {cfg, log, stats}) => {
  const key = get("youtube.api_key", cfg);
  const counter = new Counter(
    size(filter(q => q.type === querySource, envelope.queries)),
  );

  const range = {
    publishedBefore: get("youtube.published_before", cfg)
      ? moment(get("youtube.published_before", cfg), "YYYY-MM-DD").format(
          "YYYY-MM-DDTHH:mm:ssZ",
        )
      : undefined,
    publishedAfter: get("youtube.past_days", cfg)
      ? moment()
          .subtract(get("youtube.past_days", cfg), "d")
          .format("YYYY-MM-DDTHH:mm:ssZ") ||
        moment(get("youtube.published_after", cfg), "YYYY-MM-DD").format(
          "YYYY-MM-DDTHH:mm:ssZ",
        )
      : undefined,
  };

  const f = q =>
    flowP(
      [
        parseChannelQuery,
        videoChannelPlaylist(key),
        tapP(ds => {
          if (ds.length === 0) {
            // We assume the query failed if it doesn't yield any result.
            const fail = {
              type: querySource,
              term: q,
              plugin: "youtube_channel",
              reason: "Youtube channel didn't yield any results.",
            };
            stats.update(
              "failed",
              queries =>
                Array.isArray(queries) ? queries.concat(fail) : [fail],
            );
          }
          log.info(
            `Received ${size(ds)} videos for ${q}. (${counter.count()}/${
              counter.total
            })`,
          );
        }),
      ],
      q,
    );

  if (range.publishedBefore || range.publishedAfter) {
    log.info(`Fetching videos before ${range.publishedBefore}`);
    log.info(`Fetching videos after ${range.publishedAfter}`);

    const fe = q =>
      flowP(
        [
          parseChannelQuery,
          videoChannel(key, pickBy(identity, range)),
          tapP(ds =>
            log.info(
              `Received ${size(ds)} videos for ${q}. (${counter.count()}/${
                counter.total
              })`,
            ),
          ),
        ],
        q,
      );

    return env.flatMapQueriesAsync(fe, querySource, envelope);
  }

  return env.flatMapQueriesAsync(f, querySource, envelope);
};

const plugin = p.liftManyA2([assertCredentials, listChannel]);

plugin.desc = "List all videos in a youtube channel.";
plugin.source = {
  name: querySource,
  desc: "A Youtube channel ID.",
};
plugin.argv = {
  "youtube.published_after": {
    type: "string",
    nargs: 1,
    desc: "only fetch videos published after a certain date. yyyy-mm-dd",
  },
  "youtube.published_before": {
    type: "string",
    nargs: 1,
    desc: "only fetch videos published before a certain date. yyyy-mm-ss",
  },
  "youtube.past_days": {
    type: "string",
    nargs: 1,
    desc: "only fetch videos published in the past x days",
  },
};

export default plugin;
