import parsePlugin from "./plugins/parse";
import linksPlugin from "./plugins/links";
import locationPlugin from "./plugins/location";
import exportPlugin from "./plugins/export";

const plugins = {
  tika_parse: parsePlugin,
  tika_links: linksPlugin,
  tika_location: locationPlugin,
  tika_export: exportPlugin,
};

export {plugins};
export default {plugins};
