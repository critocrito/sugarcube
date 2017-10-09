import {size, isEqual} from "lodash/fp";
import {assertForall, array} from "jsverify";
import {liftManyA2} from "../lib/data/plugin";
import {asyncFn2} from "./arbitraries";

describe("SugarCube plugin", () => {
  it("lifts many binary functions to actions", () =>
    assertForall(array(asyncFn2), fs =>
      liftManyA2(fs, 0, 1).then(r => isEqual(r, size(fs)))
    ));
});
