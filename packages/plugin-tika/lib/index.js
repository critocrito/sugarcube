import parsePlugin from "./plugins/parse";
import linksPlugin from "./plugins/links";
import locationPlugin from "./plugins/location";

const plugins = {
  tika_parse: parsePlugin,
  tika_links: linksPlugin,
  tika_location: locationPlugin,
};

export {plugins};
export default {plugins};
