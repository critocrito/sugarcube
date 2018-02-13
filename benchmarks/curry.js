import benchmark from "benchmark";
import {curry} from "lodash/fp";

import {curry2, curry3, curry4, curry5} from "../packages/core/lib/utils";

const add2 = (a, b) => a + b;
const add3 = (a, b, c) => a + b + c;
const add4 = (a, b, c, d) => a + b + c + d;
const add5 = (a, b, c, d, e) => a + b + c + d + e;

const loAdd2 = curry(add2);
const loAdd3 = curry(add3);
const loAdd4 = curry(add4);
const loAdd5 = curry(add5);

const scAdd2 = curry2("add2", add2);
const scAdd3 = curry3("add3", add3);
const scAdd4 = curry4("add4", add4);
const scAdd5 = curry5("add5", add5);

const suite = new benchmark.Suite();

suite
  .add("Lodash add2", () => loAdd2(1, 23))
  .add("SugarCube add2", () => scAdd2(1, 23))
  .add("Lodash add3", () => loAdd3(1, 23, 42))
  .add("SugarCube add3", () => scAdd3(1, 23, 42))
  .add("Lodash add4", () => loAdd4(1, 23, 42, 37))
  .add("SugarCube add4", () => scAdd4(1, 23, 42, 37))
  .add("Lodash add5", () => loAdd5(1, 23, 42, 37, 66))
  .add("SugarCube add5", () => scAdd5(1, 23, 42, 37, 66))
  .add("Lodash add2 piecemeal", () => loAdd2(1)(23))
  .add("SugarCube add2 piecemeal", () => scAdd2(1)(23))
  .add("Lodash add3 piecemeal", () => loAdd3(1)(23)(42))
  .add("SugarCube add3 piecemeal", () => scAdd3(1)(23)(42))
  .add("Lodash add4 piecemeal", () => loAdd4(1)(23)(42)(37))
  .add("SugarCube add4 piecemeal", () => scAdd4(1)(23)(42)(37))
  .add("Lodash add5 piecemeal", () => loAdd5(1)(23)(42)(37)(66))
  .add("SugarCube add5 piecemeal", () => scAdd5(1)(23)(42)(37)(66))
  .on("cycle", ev => console.log(String(ev.target)))
  .on("error", e => console.error(e.target.error))
  .run();
