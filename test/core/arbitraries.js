import {curry} from "lodash/fp";
import {bless} from "jsverify";
import Promise from "bluebird";
import sinon from "sinon";

export const asyncFn = bless({generator: () => x => Promise.resolve(x + 1)});
export const asyncFn2 = bless({
  generator: () => curry((x, y) => Promise.resolve(x + y)),
});

export const spy = bless({generator: () => sinon.spy()});

export default {
  asyncFn,
  asyncFn2,
  spy,
};
