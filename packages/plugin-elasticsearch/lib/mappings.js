export default {
  mappings: {
    _doc: {
      properties: {
        $sc_id_hash: {
          type: "keyword",
          ignore_above: 64,
        },
        $sc_content_hash: {
          type: "keyword",
          ignore_above: 64,
        },
        $sc_id_fields: {
          type: "keyword",
          ignore_above: 256,
        },
        $sc_content_fields: {
          type: "keyword",
          ignore_above: 256,
        },
        $sc_downloads: {
          type: "nested",
          properties: {
            $sc_id_hash: {
              type: "keyword",
              ignore_above: 64,
            },
            type: {
              type: "keyword",
              ignore_above: 256,
            },
            term: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            location: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
            sha256: {
              type: "keyword",
              ignore_above: 64,
            },
            md5: {
              type: "keyword",
              ignore_above: 32,
            },
          },
        },
        $sc_media: {
          type: "nested",
          properties: {
            $sc_id_hash: {
              type: "keyword",
              ignore_above: 64,
            },
            type: {
              type: "keyword",
              ignore_above: 256,
            },
            term: {
              type: "keyword",
            },
          },
        },
        $sc_relations: {
          type: "nested",
          properties: {
            $sc_id_hash: {
              type: "keyword",
              ignore_above: 64,
            },
            type: {
              type: "keyword",
              ignore_above: 256,
            },
            term: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
          },
        },
        $sc_queries: {
          type: "nested",
          properties: {
            $sc_id_hash: {
              type: "keyword",
              ignore_above: 64,
            },
            type: {
              type: "keyword",
              ignore_above: 256,
            },
            term: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
          },
        },
        $sc_locations: {
          type: "nested",
          properties: {
            $sc_id_hash: {
              type: "keyword",
              ignore_above: 64,
            },
            type: {
              type: "keyword",
              ignore_above: 256,
            },
            term: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                },
              },
            },
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
            source: {
              type: "date",
            },
          },
        },
        $sc_markers: {
          type: "keyword",
          ignore_above: 64,
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
      },
    },
  },
};
