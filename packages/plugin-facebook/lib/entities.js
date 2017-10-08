import {merge} from "lodash/fp";

export const pageEntity = page =>
  merge(page, {
    _sc_id_fields: ["id"],
  });

export const userEntity = pageEntity;

export default {pageEntity, userEntity};
