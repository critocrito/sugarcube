import {curry, size, isEqual} from "lodash/fp";
import {of} from "dashp";
import jsc, {property} from "jsverify";

import {liftManyA2} from "../../packages/core/lib/data/plugin";

const fnArb = jsc.bless({
  generator: () => curry((x, y) => of(x + y)),
});

describe("SugarCube plugin", () => {
  property(
    "lifts many binary functions to actions",
    jsc.array(fnArb),
    async (fs) => isEqual(await liftManyA2(fs, 0, 1), size(fs)),
  );
});
