import parsePlugin from "./parse";
import linksPlugin from "./plugins/links";

const plugins = {
  tika_parse: parsePlugin,
  tika_links: linksPlugin,
};

export {plugins};
export default {plugins};
