import {reduce, merge, concat, has} from "lodash/fp";

const imageJpeg = unit => {
  const contentFields = reduce(
    (memo, f) => {
      if (has(f, unit)) {
        return concat(memo, f);
      }
      return memo;
    },
    unit._sc_content_fields || [],
    ["Image Height", "Image Width"]
  );

  return merge(unit, {_sc_content_fields: contentFields});
};

const applicationPdf = unit => {
  const contentFields = reduce(
    (memo, f) => {
      if (has(f, unit)) {
        return concat(memo, f);
      }
      return memo;
    },
    unit._sc_content_fields || [],
    ["text"]
  );

  return merge(unit, {_sc_content_fields: contentFields});
};

export default {
  imageJpeg,
  applicationPdf,
};
