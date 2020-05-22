import {
  curry,
  flow,
  map,
  concat,
  flatten,
  merge,
  join,
  property,
  chunk,
} from "lodash/fp";
import pify from "pify";
import request from "request";
import {parse, format} from "url";
import {flatmapP} from "dashp";

import {video, playlistVideo} from "./entities";

const getAsync = pify(request.get);

const urlify = curry((resource, params) => {
  const endpoint = "https://www.googleapis.com/youtube/v3";
  const u = parse(`${endpoint}/${resource}`);
  u.query = params;
  return format(u);
});

const getJson = url => getAsync(url).then(r => JSON.parse(r.body));

const handleError = async (action, params) => {
  const {error, ...resp} = await action(params);

  if (error != null) {
    throw new Error(error.message);
  }

  return resp;
};

const page = async (action, params, results = []) => {
  const {items, nextPageToken} = await handleError(action, params);

  if (nextPageToken) {
    return page(
      action,
      merge(params, {pageToken: nextPageToken}),
      concat(results, items),
    );
  }

  return concat(results, items);
};

const search = flow([urlify("search"), getJson]);
const videos = flow([urlify("videos"), getJson]);
const channels = flow([urlify("channels"), getJson]);
const playlistItems = flow([urlify("playlistItems"), getJson]);

const getplaylistid = async (action, params) => {
  const {items} = await handleError(action, params);
  if (items.length > 0) return items[0].contentDetails.relatedPlaylists.uploads;
  return null;
};

export const channelSearch = curry((key, range, channelId) => {
  const parts = ["id", "snippet"];
  const params = {
    type: "video",
    part: join(",", parts),
    maxResults: 50,
    channelId,
    key,
  };
  return page(search, merge(params, range));
});

export const channelExists = curry(async (key, id) => {
  const params = {
    part: "id",
    id,
    key,
  };
  const {pageInfo} = await handleError(channels, params);
  return pageInfo.totalResults > 0;
});

const channelToPlaylist = curry((key, id) => {
  const params = {
    part: "contentDetails",
    id,
    key,
  };
  return getplaylistid(channels, params);
});

const playlistVideos = curry((key, playlistId) => {
  const parts = ["id", "snippet", "status", "contentDetails"];
  const ps = {
    part: join(",", parts),
    playlistId,
    maxResults: 50,
    key,
  };
  return page(playlistItems, ps).then(map(playlistVideo));
});

export const videosList = curry((key, ids) => {
  const parts = [
    "id",
    "snippet",
    "contentDetails",
    "statistics",
    "status",
    "recordingDetails",
    "topicDetails",
  ];
  const params = {
    part: join(",", parts),
    id: join(",", Array.isArray(ids) ? ids : [ids]),
    maxResults: 50,
    key,
  };

  return page(videos, params).then(map(video));
});

export const videosListCheck = curry((key, ids) => {
  const parts = ["id"];
  const params = {
    part: join(",", parts),
    id: join(",", Array.isArray(ids) ? ids : [ids]),
    maxResults: 50,
    key,
  };

  return page(videos, params);
});

export const videoChannel = curry(async (key, range, id) => {
  const resp = await channelSearch(key, range, id);
  const ids = map(property("id.videoId"), resp);
  // There is a limit on how many video ids can be queried at once.
  return flatmapP(videosList(key), chunk(50, ids));
});

export const videoChannelPlaylist = curry(async (key, id) => {
  const playlistId = await channelToPlaylist(key, id);
  if (playlistId != null) return flatten(await playlistVideos(key, playlistId));
  return [];
});

export default {
  channelSearch,
  videosList,
  videosListCheck,
  videoChannel,
  videoChannelPlaylist,
};
