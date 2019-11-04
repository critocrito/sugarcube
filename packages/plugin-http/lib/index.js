import {
  flow,
  intersection,
  keys,
  pick,
  forEach,
  merge,
  values,
} from "lodash/fp";

import getPlugin from "./plugins/get";
import wgetPlugin from "./plugins/wget";
import importPlugin from "./plugins/import";

const plugins = {
  http_get: getPlugin,
  http_wget: wgetPlugin,
  http_import: importPlugin,
};

const dataPlugins = flow([
  keys,
  intersection(["http_get", "http_wget"]),
  ps => pick(ps, plugins),
])(plugins);

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
}, values(dataPlugins));

export {plugins};
export default {plugins};
