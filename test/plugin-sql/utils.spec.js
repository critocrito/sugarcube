import {flattenObj} from "../../packages/plugin-sql/lib/utils";

describe("flattening objects", () => {
  it("can be deeply nested", () => {
    const obj = {a: 23, b: {c: 42, d: {e: 667}}};
    const expected = {a: 23, "b.c": 42, "b.d.e": 667};

    const result = flattenObj(obj);

    result.should.eql(expected);
  });
});
