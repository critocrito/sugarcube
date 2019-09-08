import {size, get, pickBy, identity} from "lodash/fp";
import {flowP, tapP} from "dashp";
import {plugin as p, envelope as env} from "@sugarcube/core";
import parse from "date-fns/parse";
import format from "date-fns/format";
import subDays from "date-fns/sub_days";

import {assertCredentials, parseChannelQuery} from "../utils";
import {videoChannelPlaylist, videoChannel, channelExists} from "../api";

const querySource = "youtube_channel";

const listChannel = (envelope, {cfg, log, stats}) => {
  const key = get("youtube.api_key", cfg);
  const publishedBefore = get("youtube.published_before", cfg);
  const publishedAfter = get("youtube.published_after", cfg);
  const pastDays = get("youtube.past_days", cfg);
  let range;

  if (publishedBefore != null || publishedAfter != null || pastDays != null) {
    const till = publishedBefore == null ? new Date() : parse(publishedBefore);
    let from;
    // pastDays takes precedence over publishedAfter
    if (pastDays != null) {
      from = subDays(till, pastDays);
    } else if (publishedAfter != null) {
      from = parse(publishedAfter);
    }
    if (from >= till) {
      log.warn(
        `published_before is before published_after. Did you mean to switch them around?`,
      );
    } else {
      range = Object.assign(
        {},
        {publishedBefore: format(till)},
        from ? {publishedAfter: format(from)} : {},
      );
    }
  }
  if (range)
    log.info(
      `Limiting queries from ${range.publishedAfter} till ${range.publishedBefore}`,
    );

  const op = range
    ? videoChannel(key, pickBy(identity, range))
    : videoChannelPlaylist(key);

  const retrieveChannel = query =>
    flowP(
      [
        parseChannelQuery,
        async q => {
          const exists = await channelExists(key, q);
          if (!exists) {
            stats.fail({
              type: querySource,
              term: q,
              plugin: "youtube_channel",
              reason: "Youtube channel does not exist.",
            });

            log.warn(`Channel ${q} does not exist.`);
          }
          return exists
            ? flowP([
                op,
                tapP(ds => {
                  log.info(`Received ${size(ds)} videos for ${query}.`);
                }),
              ])(query)
            : [];
        },
      ],
      query,
    );

  return env.flatMapQueriesAsync(retrieveChannel, querySource, envelope);
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
