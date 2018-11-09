import mergePlugin from "./plugins/merge";
import multiplexPlugin from "./plugins/multiplex";

export const plugins = {
  workflow_multiplex: multiplexPlugin,
  workflow_merge: mergePlugin,
};

export default {plugins};
