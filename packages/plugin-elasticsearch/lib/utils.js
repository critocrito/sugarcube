/* eslint-disable no-use-before-define, no-plusplus, no-continue */
import {omit, isPlainObject, isArray} from "lodash/fp";

const mapUnitKeys = (fn, unit) => {
  const mapArrays = ary => {
    const newAry = [];
    for (let i = 0; i < ary.length; i++) {
      const value = ary[i];
      if (isPlainObject(value)) {
        newAry.push(mapUnitKeys(fn, value));
      } else if (isArray(value)) {
        newAry.push(mapArrays(value));
      } else {
        newAry.push(value);
      }
    }
    return newAry;
  };

  const keys = Object.keys(unit);
  const obj = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const newKey = fn(key);

    if (isPlainObject(unit[key])) {
      obj[newKey] = mapUnitKeys(fn, unit[key]);
      continue;
    }
    if (isArray(unit[key])) {
      obj[newKey] = mapArrays(unit[key]);
      continue;
    }
    obj[newKey] = unit[key];
  }

  return obj;
};

export const stripUnderscores = unit =>
  mapUnitKeys(key => key.replace(/^[_]+/, "$"), unit);
export const unstripify = unit =>
  mapUnitKeys(key => key.replace(/^[$$]/, "_"), unit);

export const omitFromData = (fields, data) => {
  const FIELD_NAME = /^_sc_elastic/;
  return data.map(unit => {
    const internalFields = Object.keys(unit).filter(k => FIELD_NAME.test(k));
    return omit(internalFields.concat(fields), unit);
  });
};
