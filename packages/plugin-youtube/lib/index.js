import {forEach, merge} from "lodash/fp";
import channelPlugin from "./plugins/channel";
import videoPlugin from "./plugins/video";

const plugins = {
  youtube_channel: channelPlugin,
  youtube_video: videoPlugin,
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

export {plugins};

export default {plugins};
