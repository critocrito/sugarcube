import {parseTweetId} from "../../packages/plugin-twitter/lib/utils";

describe("query format parsing", () => {
  it("can parse a regular id string", () => {
    const tweetId = "990930831148572672";
    const expected = tweetId;
    const result = parseTweetId(tweetId);
    result.should.equal(expected);
  });

  it("can parse a full tweet URL", () => {
    const tweetId =
      "https://twitter.com/RFS_mediaoffice/status/990930831148572672";
    const expected = "990930831148572672";
    const result = parseTweetId(tweetId);
    result.should.equal(expected);
  });
});
