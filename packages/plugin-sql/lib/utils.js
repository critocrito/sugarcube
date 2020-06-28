import {isPlainObject} from "lodash/fp";

export const flattenObj = obj => {
  const iter = (o, prefix) =>
    [].concat(
      ...Object.keys(o).map(k =>
        isPlainObject(o[k])
          ? iter(o[k], `${prefix}${prefix === "" ? "" : "."}${k}`)
          : {[`${prefix}${prefix === "" ? "" : "."}${k}`]: o[k]},
      ),
    );

  return Object.assign({}, ...[].concat(iter(obj, "")));
};
