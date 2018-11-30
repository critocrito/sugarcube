import {merge} from "lodash/fp";
import parse from "date-fns/parse";

export const video = item => {
  let locations = [];
  if (
    item.recordingDetails != null ||
    item.recordingDetails.location != null ||
    item.recordingDetails.location.longitude != null ||
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

  return merge(item, {
    _sc_id_fields: ["id"],
    _sc_content_fields: ["snippet.title", "snippet.description"],
    _sc_pubdates: {source: parse(item.snippet.publishedAt)},
    _sc_locations: locations,
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

export const playlistVideo = item =>
  video(
    merge(item, {
      id: item.contentDetails.videoId,
      playlist_id: item.id,
    }),
  );

export default {video, playlistVideo};
