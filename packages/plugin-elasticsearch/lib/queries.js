const byIds = ids => ({
  query: {
    ids: {
      values: ids,
    },
  },
});

export default {byIds};
