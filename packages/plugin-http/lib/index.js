import {forEach, merge, values} from "lodash/fp";

import getPlugin from "./plugins/get";
import wgetPlugin from "./plugins/wget";

const plugins = {
  http_get: getPlugin,
  http_wget: wgetPlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "http.download_dir": {
        type: "string",
        nargs: 1,
        default: "downloads",
        desc: "The path to the download directory.",
      },
    },
    p.argv
  );
}, values(plugins));

export {plugins};
export default {plugins};
