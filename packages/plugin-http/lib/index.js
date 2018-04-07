import {forEach, merge, values} from "lodash/fp";

import getPlugin from "./plugins/get";
import wgetPlugin from "./plugins/wget";
import screenshotPlugin from "./plugins/screenshot";

const plugins = {
  http_get: getPlugin,
  http_wget: wgetPlugin,
  http_screenshot: screenshotPlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "http.data_dir": {
        type: "string",
        nargs: 1,
        default: "data",
        desc: "The path to the download directory.",
      },
    },
    p.argv,
  );
}, values(plugins));

export {plugins};
export default {plugins};
