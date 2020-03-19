import {every} from "lodash/fp";
import {
  parseTweetId,
  parseTwitterUser,
  normalizeTwitterTweetUrl,
  normalizeTwitterUserUrl,
  isTwitterFeed,
  isTwitterTweet,
} from "../../packages/plugin-twitter/lib/utils";

const tweetUrls = [
  "https://twitter.com/Ibrahim_waza/status/1073152537400934400",
  "https://twitter.com/LorianSynaro/status/1101881275558825985/photo/1",
  "https://mobile.twitter.com/kamalrahmtalla1/status/1150487367037440000?fbclid=IwAR2429sTkE",
  "https://twitter.com/i/status/1101499653441372160",
];

const notTweetUrls = [
  "https://tweetdeck.twitter.com/",
  "https://twitter.com/search?q=%23موكب14مارس&src=hash",
];

const feedUrls = ["https://twitter.com/WADHOSHA"];

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

  it("can parse a direct photo URL as tweet id", () => {
    const tweetId =
      "https://twitter.com/LorianSynaro/status/1101881275558825985/photo/1";
    const expected = "1101881275558825985";
    const result = parseTweetId(tweetId);
    result.should.equal(expected);
  });

  it("returns null when tweet id is undefined", () => {
    const tweetId = undefined;
    const result = parseTweetId(tweetId);
    // eslint-disable-next-line no-unused-expressions, eqeqeq
    (result == null).should.true;
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

describe("parse twitter tweet urls", () => {
  it("can parse tweet urls", () => {
    const result = every(isTwitterTweet, tweetUrls);

    result.should.equal(true);
  });

  it("fails similar tweet urls", () => {
    const result = every(isTwitterTweet, notTweetUrls);

    result.should.equal(false);
  });

  it("fails feed urls", () => {
    const result = every(isTwitterTweet, feedUrls);

    result.should.equal(false);
  });

  it("can normalize twitter tweet urls", () => {
    const urls = [
      "https://twitter.com/Ibrahim_waza/status/1073152537400934400",
      "https://twitter.com/Ibrahim_waza/status/1073152537400934400/photo/1",
      "https://mobile.twitter.com/Ibrahim_waza/status/1073152537400934400?fbclid=IwAR2429sTkE",
    ];

    const expected =
      "https://twitter.com/Ibrahim_waza/status/1073152537400934400";

    const result = every(u => normalizeTwitterTweetUrl(u) === expected, urls);

    result.should.equal(true);
  });

  it("can normalize twitter tweet ids", () => {
    const id = "1073152537400934400";

    const expected = "https://twitter.com/i/status/1073152537400934400";

    const result = normalizeTwitterTweetUrl(id);

    result.should.equal(expected);
  });
});

describe("parse twitter feed urls", () => {
  it("can parse feed urls", () => {
    const result = every(isTwitterFeed, feedUrls);

    result.should.equal(true);
  });

  it("fails to parse feed urls", () => {
    const result = every(isTwitterFeed, tweetUrls.concat(notTweetUrls));

    result.should.equal(false);
  });

  it("can normalize twitter user urls", () => {
    const urls = ["https://twitter.com/WADHOSHA", "WADHOSHA", "@WADHOSHA"];

    const expected = "https://twitter.com/WADHOSHA";

    const result = every(u => normalizeTwitterUserUrl(u) === expected, urls);

    result.should.equal(true);
  });
});
