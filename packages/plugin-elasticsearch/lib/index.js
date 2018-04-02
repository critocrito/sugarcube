import {forEach, merge, values} from "lodash/fp";
import importPlugin from "./plugins/import";
import exportPlugin from "./plugins/export";
import complementPlugin from "./plugins/complement";
import complementLeftPlugin from "./plugins/complement-left";
import {Elastic} from "./elastic";

const plugins = {
  elastic_import: importPlugin,
  elastic_export: exportPlugin,
  elastic_complement: complementPlugin,
  elastic_complement_left: complementLeftPlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "elastic.host": {
        type: "string",
        default: "localhost",
        nargs: 1,
        desc: "The hostname of Elasticsearch.",
      },
      "elastic.port": {
        type: "string",
        default: "9200",
        nargs: 1,
        desc: "The port of Elasticsearch",
      },
      "elastic.index": {
        type: "string",
        default: "sugarcube",
        nargs: 1,
        desc: "The index prefix to use.",
      },
    },
    p.argv
  );
}, values(plugins));

export {Elastic} from "./elastic";
export {plugins};
export default {plugins, Elastic};
