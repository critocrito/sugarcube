import {forEach, merge, values} from "lodash/fp";

import checkPlugin from "./check";

const plugins = {
  tor_check: checkPlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "json.prettify": {
        default: false,
        type: "boolean",
        desc: "Prettify the JSON output.",
      },
    },
    p.argv,
  );
}, values(plugins));

export {plugins};
export default {plugins};
