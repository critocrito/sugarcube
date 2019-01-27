import {
  parseTweetId,
  parseTwitterUser,
} from "../../packages/plugin-twitter/lib/utils";

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

  it("can parse a twitter user name", () => {
    const userName = "my_user";
    const expected = userName;
    const result = parseTwitterUser(userName);
    result.should.equal(expected);
  });

  it("can parse a twitter user name with an @", () => {
    const userName = "@my_user";
    const expected = "my_user";
    const result = parseTwitterUser(userName);
    result.should.equal(expected);
  });

  it("can parse a twitter user id", () => {
    const userId = "3067493325";
    const expected = userId;
    const result = parseTwitterUser(userId);
    result.should.equal(expected);
  });

  it("can parse a twitter user id as integer", () => {
    const userId = 3067493325;
    const expected = userId.toString();
    const result = parseTwitterUser(userId);
    result.should.equal(expected);
  });

  it("can parse a full twitter url", () => {
    const userId = "https://twitter.com/my_user";
    const expected = "my_user";
    const result = parseTwitterUser(userId);
    result.should.equal(expected);
  });
});
