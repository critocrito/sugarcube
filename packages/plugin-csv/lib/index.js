import {merge, values, forEach} from "lodash/fp";
import exportPlugin from "./plugins/export";
import importPlugin from "./plugins/import";
import {parse, parseMany} from "./parse";

const plugins = {
  csv_export: exportPlugin,
  csv_import: importPlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "csv.delimiter": {
        type: "string",
        nargs: 1,
        default: ",",
        desc: "Use as CSV delimeter",
      },
    },
    p.argv
  );
}, values(plugins));

export {plugins, parse, parseMany};
export default {plugins, parse, parseMany};
