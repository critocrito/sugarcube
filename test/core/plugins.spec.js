import {size, isEqual} from "lodash/fp";
import {assertForall, array} from "jsverify";
import {plugin} from "../../packages/core";

import {asyncFn2} from "./arbitraries";

const {liftManyA2} = plugin;

describe("SugarCube plugin", () => {
  it("lifts many binary functions to actions", () =>
    assertForall(array(asyncFn2), fs =>
      liftManyA2(fs, 0, 1).then(r => isEqual(r, size(fs)))
    ));
});
