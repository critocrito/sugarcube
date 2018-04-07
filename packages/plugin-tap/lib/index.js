import {forEach, merge, values} from "lodash/fp";
import printf from "./printf";
import writef from "./writef";

const plugins = {
  tap_printf: printf,
  tap_writef: writef,
};

forEach(p => {
  // eslint-disable-next-line no-param-reassign
  p.argv = merge(
    {
      "tap.limit": {
        type: "number",
        nargs: 1,
        desc: "Limit the output to <n> data units.",
      },
    },
    p.argv,
  );
}, values(plugins));

export {plugins};
export default {plugins};
