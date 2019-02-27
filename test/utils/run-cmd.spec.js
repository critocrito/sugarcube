import {runCmd} from "../../packages/utils/lib";

describe("the runCmd utility", () => {
  it("resolves on success", async () => {
    const cmd = "node";
    const args = ["-v"];

    const result = await runCmd(cmd, args);

    result.should.be.a("string");
  });

  it("should reject on errors", () => {
    const cmd = "non-existing-cmd";
    const args = [];

    return runCmd(cmd, args).should.be.rejected;
  });
});
