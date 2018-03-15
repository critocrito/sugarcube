import {mergeAll} from "lodash/fp";

const base = {
  $sc_downloads: {
    type: "nested",
  },
  $sc_relations: {
    type: "nested",
  },
  $sc_media: {
    type: "nested",
  },
  $sc_queries: {
    type: "nested",
  },
};

const webSearches = {
  href_text: {
    type: "text",
    index_options: "offsets",
  },
};

const feed = {
  message: {
    type: "text",
    index_options: "offsets",
  },
  "snippet.description": {
    type: "text",
    index_options: "offsets",
  },
};

export default {
  units: base,
  "web-searches": mergeAll([base, webSearches]),
  feed: mergeAll([base, feed]),
};
