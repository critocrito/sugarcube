import {merge, values, forEach} from "lodash/fp";
import exportPlugin from "./plugins/export";
import importPlugin from "./plugins/import";
import diffPlugin from "./plugins/diff";
import {parse, parseMany} from "./parse";

const plugins = {
  csv_export: exportPlugin,
  csv_import: importPlugin,
  csv_diff: diffPlugin,
};

const importPlugins = [importPlugin, diffPlugin];

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

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "csv.id_fields": {
        nargs: 1,
        desc: "Specify the id fields separated by a comma.",
        coerce: arg => arg.split(","),
      },
    },
    p.argv
  );
}, importPlugins);

export {plugins, parse, parseMany};
export default {plugins, parse, parseMany};
