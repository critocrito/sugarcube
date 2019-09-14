export default {
  settings: {
    analysis: {
      filter: {
        trigrams_filter: {
          type: "ngram",
          min_gram: 3,
          max_gram: 3,
        },
      },
      analyzer: {
        trigrams: {
          type: "custom",
          tokenizer: "standard",
          filter: ["lowercase", "trigrams_filter"],
        },
        exact: {
          tokenizer: "standard",
          filter: ["lowercase"],
        },
      },
    },
  },

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
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
              ignore_above: 256,
            },
          },
        },

        $sc_content_fields: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
              ignore_above: 256,
            },
          },
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
                  ignore_above: 256,
                },
              },
            },
            location: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                  ignore_above: 256,
                },
              },
            },
            mosaic: {
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                  ignore_above: 256,
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
              type: "text",
              fields: {
                keyword: {
                  type: "keyword",
                  ignore_above: 256,
                },
              },
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
                  ignore_above: 256,
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
                  ignore_above: 256,
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
                  ignore_above: 256,
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
      },
    },
  },
};
