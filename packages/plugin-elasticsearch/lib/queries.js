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

const reindex = (fromIndex, fromHost, fromPort, toIndex) => ({
  source: {
    remote: {
      host: `http://${fromHost}:${fromPort}`,
      socket_timeout: "1m",
      connect_timeout: "1m",
    },
    size: 500,
    index: fromIndex,
  },
  dest: {
    index: toIndex,
  },
});

export default {byIds, existing, reindex};
