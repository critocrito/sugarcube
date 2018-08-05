export default {
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
  $sc_locations: {
    type: "nested",
    properties: {
      location: {
        type: "geo_point",
      },
    },
  },
  $sc_pubdates: {
    properties: {
      fetch: {
        type: "date",
      },
      pipeline: {
        type: "date",
      },
    },
  },
  $sc_elastic_score: {
    type: "long",
  },
  // web searches
  href_text: {
    type: "text",
    index_options: "offsets",
  },
  // social media
  message: {
    type: "text",
    index_options: "offsets",
  },
  "snippet.description": {
    type: "text",
    index_options: "offsets",
  },
};
