import {set, merge, getOr} from "lodash/fp";

export const state = (obj = {}) => {
  let s =
    obj != null && obj.get != null && obj.update != null
      ? Object.assign({}, obj.get())
      : Object.assign({}, obj);

  const get = path => (path ? getOr({}, path, s) : s);

  const update = (...args) => {
    let [path, f] = args;
    if (!f) {
      f = path;
      path = null;
    }

    const calc = data => {
      const applied = path ? f(getOr({}, path, data)) : f(data);
      const expanded = path ? set(path, applied, {}) : applied;
      return merge(data, expanded);
    };

    s = calc(s);

    return s;
  };

  return {
    get,
    update,
  };
};

export default {state};
