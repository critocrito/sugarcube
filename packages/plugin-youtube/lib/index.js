import {forEach, merge} from "lodash/fp";
import channelPlugin from "./plugins/channel";
import videoPlugin from "./plugins/video";
import filterFailingPlugin from "./plugins/filter-failing";
import {
  parseYoutubeVideo,
  parseYoutubeChannel,
  normalizeYoutubeVideoUrl,
  normalizeYoutubeChannelUrl,
  isYoutubeVideo,
  isYoutubeChannel,
} from "./utils";

const plugins = {
  youtube_channel: channelPlugin,
  youtube_video: videoPlugin,
  youtube_filter_failing: filterFailingPlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "youtube.api_key": {
        type: "string",
        nargs: 1,
        desc: "The youtube API key.",
      },
    },
    p.argv,
  );
}, plugins);

export {
  plugins,
  parseYoutubeVideo,
  parseYoutubeChannel,
  normalizeYoutubeVideoUrl,
  normalizeYoutubeChannelUrl,
  isYoutubeVideo,
  isYoutubeChannel,
};

export default {
  plugins,
  parseYoutubeVideo,
  parseYoutubeChannel,
  normalizeYoutubeVideoUrl,
  normalizeYoutubeChannelUrl,
  isYoutubeVideo,
  isYoutubeChannel,
};
