import {forEach, merge, values} from "lodash/fp";

import searchPlugin from "./search";

const plugins = {
  guardian_search: searchPlugin,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "guardian.key": {
        type: "string",
        desc: "An API key for authentication.",
      },
    },
    p.argv
  );
}, values(plugins));

export {plugins};
export default {plugins};
