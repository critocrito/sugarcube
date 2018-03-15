import {Elastic} from "../../packages/plugin-elasticsearch/lib/elastic";

describe("The elasticsearch context", () => {
  it("has a do context", () => Elastic.Do.should.be.a("function"));
});
