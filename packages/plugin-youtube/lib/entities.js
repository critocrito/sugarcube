import {merge, mergeAll, get, getOr} from "lodash/fp";
import parse from "date-fns/parse";
import {createFeatureDecisions} from "@sugarcube/core";

// Use deprecated Sugarcube data format. This is still the default but will be
// replaced with the data formate defined in ncubeVideo below.
export const deprecatedVideo = item => {
  let locations = [];
  if (
    item.recordingDetails != null &&
    item.recordingDetails.location != null &&
    item.recordingDetails.location.longitude != null &&
    item.recordingDetails.location.latitude != null
  ) {
    const {longitude, latitude} = item.recordingDetails.location;
    const location = {
      location: {lon: longitude, lat: latitude},
      type: "youtube_recording",
      term: [longitude, latitude],
      description: item.recordingDetails.locationDescription,
    };
    locations = [location];
  }
  const language =
    item.snippet != null && item.snippet.defaultLanguage != null
      ? item.snippet.defaultLanguage
      : null;

  return merge(item, {
    _sc_id_fields: ["id"],
    _sc_content_fields: ["snippet.title", "snippet.description"],
    _sc_pubdates: {source: parse(item.snippet.publishedAt)},
    _sc_locations: locations,
    _sc_language: language,
    _sc_media: [
      {
        type: "image",
        term: item.snippet.thumbnails.high.url,
        width: item.snippet.thumbnails.high.width,
        height: item.snippet.thumbnails.high.height,
      },
      {
        type: "video",
        term: `https://www.youtube.com/watch?v=${item.id}`,
      },
      {
        type: "url",
        term: `https://www.youtube.com/watch?v=${item.id}`,
      },
    ],
  });
};

// This formats a youtube video in the format that is compatible with the SQL plugin and Ncube.
export const ncubeVideo = item => {
  const id = get("id", item);
  const href = `https://youtube.com/watch?v=${id}`;
  const title = get("snippet.title", item);
  const description = get("snippet.description", item);
  const channelId = get("snippet.channelId", item);
  const channel = get("snippet.channelTitle", item);
  const stats = getOr({}, "snippt.statistics", item);
  const createdAt = get("snippet.publishedAt", item);

  let locations = [];
  if (
    item.recordingDetails != null &&
    item.recordingDetails.location != null &&
    item.recordingDetails.location.longitude != null &&
    item.recordingDetails.location.latitude != null
  ) {
    const {longitude, latitude} = item.recordingDetails.location;
    const location = {
      location: {lon: longitude, lat: latitude},
      type: "youtube_recording",
      term: [longitude, latitude],
      description: item.recordingDetails.locationDescription,
    };
    locations = [location];
  }
  const language =
    item.snippet != null && item.snippet.defaultLanguage != null
      ? item.snippet.defaultLanguage
      : null;

  return mergeAll([
    {
      _sc_id: id,
      _sc_href: href,
      _sc_title: title,
      _sc_description: description,
      _sc_id_fields: ["_sc_id"],
      _sc_content_fields: ["_sc_title", "_sc_description"],
      _sc_pubdates: {source: parse(createdAt)},
      _sc_entity: "youtube_video",
      _sc_locations: locations,
      _sc_language: language,
      _sc_stats: stats,
      _sc_media: [
        {
          type: "image",
          term: item.snippet.thumbnails.high.url,
          width: item.snippet.thumbnails.high.width,
          height: item.snippet.thumbnails.high.height,
        },
        {
          type: "video",
          term: `https://www.youtube.com/watch?v=${item.id}`,
        },
        {
          type: "url",
          term: `https://www.youtube.com/watch?v=${item.id}`,
        },
      ],
      _sc_data: item,
    },
    channelId != null
      ? {
          _sc_channel_href: `https://youtube.com/channel/${channelId}`,
          _sc_channel_id: channelId,
          _sc_channel: channel,
        }
      : {},
  ]);
};

export const video = item => {
  const decisions = createFeatureDecisions();

  if (decisions.canNcube()) return ncubeVideo(item);
  return deprecatedVideo(item);
};

export const playlistVideo = item =>
  video(
    merge(item, {
      id: item.contentDetails.videoId,
      playlist_id: item.id,
    }),
  );

export default {video, playlistVideo};
