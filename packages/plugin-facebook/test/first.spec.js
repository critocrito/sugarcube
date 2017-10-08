import {isEqual} from "lodash/fp";
import {assertForall, nat} from "jsverify";

describe("basic math", () => {
  // a + b = b + a
  it("addition is commutative", () =>
    assertForall(nat, nat, (a, b) => isEqual(a + b, b + a)));

  // (a + b) + c = a + (b + c)
  it("addition is associative", () =>
    assertForall(nat, nat, nat, (a, b, c) => {
      const lhs = a + b + c;
      const rhs = a + (b + c);
      return isEqual(lhs, rhs);
    }));
});
