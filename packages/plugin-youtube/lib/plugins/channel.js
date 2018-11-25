import {size, get, pickBy, identity, filter} from "lodash/fp";
import {flowP, tapP} from "dashp";
import {plugin as p, envelope as env} from "@sugarcube/core";
import moment from "moment";

import {Counter, assertCredentials, parseChannelQuery} from "../utils";
import {videoChannelPlaylist, videoChannel, channelExists} from "../api";

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

  const f = query =>
    flowP(
      [
        parseChannelQuery,
        async q => {
          const exists = await channelExists(key, q);
          if (!exists) {
            const fail = {
              type: querySource,
              term: q,
              plugin: "youtube_channel",
              reason: "Youtube channel doesn't exist.",
            };
            stats.update(
              "failed",
              queries =>
                Array.isArray(queries) ? queries.concat(fail) : [fail],
            );
          }
          return exists ? videoChannelPlaylist(key, query) : [];
        },
        tapP(ds =>
          log.info(
            `Received ${size(ds)} videos for ${query}. (${counter.count()}/${
              counter.total
            })`,
          ),
        ),
      ],
      query,
    );

  if (range.publishedBefore || range.publishedAfter) {
    log.info(`Fetching videos before ${range.publishedBefore}`);
    log.info(`Fetching videos after ${range.publishedAfter}`);

    const fe = query =>
      flowP(
        [
          parseChannelQuery,
          async q => {
            const exists = await channelExists(key, q);
            if (!exists) {
              const fail = {
                type: querySource,
                term: q,
                plugin: "youtube_channel",
                reason: "Youtube channel doesn't exist.",
              };
              stats.update(
                "failed",
                queries =>
                  Array.isArray(queries) ? queries.concat(fail) : [fail],
              );
            }
            return exists
              ? videoChannel(key, pickBy(identity, range), query)
              : [];
          },
          tapP(ds =>
            log.info(
              `Received ${size(ds)} videos for ${query}. (${counter.count()}/${
                counter.total
              })`,
            ),
          ),
        ],
        query,
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
