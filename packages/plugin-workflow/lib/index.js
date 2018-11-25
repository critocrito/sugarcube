import mergePlugin from "./plugins/merge";
import multiplexPlugin from "./plugins/multiplex";
import multiplexEndPlugin from "./plugins/multiplex-end";

export const plugins = {
  workflow_multiplex: multiplexPlugin,
  workflow_merge: mergePlugin,
  workflow_multiplex_end: multiplexEndPlugin,
};

export default {plugins};
