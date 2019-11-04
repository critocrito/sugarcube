import {curry, reduce, mergeAll, concat, has, identity} from "lodash/fp";
import moment from "moment";

import {extract as tikaExtract} from "@sugarcube/utils";

import ct from "./content-types";

const contentTypes = {
  "image/jpeg": ct.imageJpeg,
  "application/pdf": ct.applicationPdf,
};

export const extract = tikaExtract;

// safeExtract is useful for fetching links, that might otherwise throw silly
// errors. E.g. LinkedIn return error 999 and extract throws up on that.
export const safeExtract = location => extract(location).catch(() => ["", {}]);

export const entity = curry((unit, text, meta) => {
  const created = moment(meta.date)
    .utc()
    .toDate();

  const idFields = reduce(
    (memo, f) => {
      if (has(f, meta)) {
        return concat(memo, f);
      }
      return memo;
    },
    unit._sc_id_fields || [],
    ["Content-Type"],
  );

  const contentFields = reduce(
    (memo, f) => {
      if (has(f, meta)) {
        return concat(memo, f);
      }
      return memo;
    },
    unit._sc_content_fields || [],
    ["title"],
  );

  const contentType = has(meta["Content-Type"], contentTypes)
    ? contentTypes[meta["Content-Type"]]
    : identity;

  return contentType(
    mergeAll([
      unit,
      meta,
      {text},
      {
        _sc_pubdates: {tika: created},
        _sc_id_fields: idFields,
        _sc_content_fields: contentFields,
      },
    ]),
  );
});
