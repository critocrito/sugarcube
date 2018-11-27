const byIds = ids => ({
  query: {
    ids: {
      values: ids,
    },
  },
});

const existing = ids =>
  Object.assign(
    {
      _source: ["$sc_id_hash"],
    },
    byIds(ids),
  );

export default {byIds, existing};
