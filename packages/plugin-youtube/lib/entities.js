import {merge} from "lodash/fp";
import moment from "moment";

export const video = item =>
  merge(item, {
    _sc_id_fields: ["id"],
    _sc_content_fields: ["snippet.title", "snippet.description"],
    _sc_pubdates: {source: moment.utc(item.snippet.publishedAt).toDate()},
    _sc_media: [
      {
        type: "thumbnail",
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

export const playlistVideo = item =>
  merge(item, {
    id: item.contentDetails.videoId,
    playlist_id: item.id,
    _sc_id_fields: ["id"],
    _sc_content_fields: ["snippet.title", "snippet.description"],
    _sc_pubdates: {source: moment.utc(item.snippet.publishedAt).toDate()},
    _sc_media: [
      {
        type: "thumbnail",
        term: item.snippet.thumbnails.high.url,
        width: item.snippet.thumbnails.high.width,
        height: item.snippet.thumbnails.high.height,
      },
      {
        type: "video",
        term: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
      },
      {
        type: "url",
        term: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
      },
    ],
  });

export default {video, playlistVideo};
