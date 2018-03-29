import createFeatureDecisions from "../../packages/core/lib/features";

describe("feature toggles", () => {
  afterEach(() => {
    createFeatureDecisions.reset();
  });

  it("creates a decision object", () => {
    const decisions = createFeatureDecisions(["featOne", "featTwo"]);
    decisions.canFeatOne().should.equal(true);
    decisions.canFeatTwo().should.equal(true);
  });

  it("returns an empty object if there are no features", () => {
    const decisions = createFeatureDecisions();
    decisions.should.eql({});
  });

  it("memoizes a feature configuration", () => {
    createFeatureDecisions(["featOne", "featTwo"]);
    const decisions = createFeatureDecisions();
    decisions.canFeatOne().should.equal(true);
    decisions.canFeatTwo().should.equal(true);
  });

  it("can iteratively extend the decision object", () => {
    createFeatureDecisions(["featOne"]);
    const decisions = createFeatureDecisions(["featTwo"]);
    decisions.canFeatOne().should.equal(true);
    decisions.canFeatTwo().should.equal(true);
  });

  it("disables all other possible features", () => {
    const decisions = createFeatureDecisions();
    decisions.canFeatOne().should.equal(false);
  });
});
