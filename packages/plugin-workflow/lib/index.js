import mergePlugin from "./plugins/merge";
import multiplexPlugin from "./plugins/multiplex";
import multiplexEndPlugin from "./plugins/multiplex-end";
import mergeQueryPlugin from "./plugins/merge-query";
import omitPlugin from "./plugins/omit";

export const plugins = {
  workflow_multiplex: multiplexPlugin,
  workflow_merge: mergePlugin,
  workflow_multiplex_end: multiplexEndPlugin,
  workflow_merge_query: mergeQueryPlugin,
  workflow_omit: omitPlugin,
};

export default {plugins};
