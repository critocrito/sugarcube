import {merge, values, forEach} from "lodash/fp";
import exportPlugin from "./export";
import importPlugin from "./import";

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

export {plugins};

export default {
  plugins,
};
