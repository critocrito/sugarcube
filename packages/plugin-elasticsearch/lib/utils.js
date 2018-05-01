/* eslint-disable no-use-before-define */
import {omit, merge, isPlainObject, isArray} from "lodash/fp";
import {utils} from "@sugarcube/core";

const {curry2} = utils;

const mapUnitKeys = curry2("mapUnitKeys", (fn, unit) => {
  const mapArrays = ary =>
    ary.map(value => {
      if (isPlainObject(value)) return mapUnitKeys(fn, value);
      if (isArray(value)) return mapArrays(value);
      return value;
    });

  return Object.keys(unit).reduce((memo, key) => {
    const newKey = fn(key);

    if (isPlainObject(unit[key]))
      return merge(memo, {[newKey]: mapUnitKeys(fn, unit[key])});
    if (isArray(unit[key]))
      return merge(memo, {[newKey]: mapArrays(unit[key])});
    return merge(memo, {[newKey]: unit[key]});
  }, {});
});

export const stripUnderscores = mapUnitKeys(key => key.replace(/^[_]+/, "$"));
export const unstripify = mapUnitKeys(key => key.replace(/^[$$]/, "_"));

export const omitFromData = (fields, data) => {
  if (fields) return data.map(omit(fields.split(",")));
  return data;
};
