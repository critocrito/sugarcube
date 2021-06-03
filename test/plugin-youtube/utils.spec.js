import {every} from "lodash/fp";
import {
  parseYoutubeVideo,
  parseYoutubeChannel,
  normalizeYoutubeVideoUrl,
  normalizeYoutubeChannelUrl,
  isYoutubeVideo,
  isYoutubeChannel,
} from "../../packages/plugin-youtube/lib/utils";

const videoUrls = [
  "https://www.youtube.com/watch?v=tcCBtSjKEzI",
  "http://youtu.be/o0tjic523cg",
  "https://www.youtube.com/embed/iq_XLq5ONtE?version",
];

const notVideoUrls = [
  "https://www.youtube.com/results?search_query=sudan%27s+livestream+Massacre",
];

const channelUrls = [
  "https://www.youtube.com/channel/UCegnDJbvrOhvbLU3IzeIV8A",
];

describe("query format parsing", () => {
  it("can parse the video id from a video id", () => {
    const videoId = "gui_SE8rJUM";

    const expected = videoId;
    const result = parseYoutubeVideo(videoId);

    result.should.equal(expected);
  });

  it("can parse the video id from a video url", () => {
    const videoUrl = "https://www.youtube.com/watch?v=gui_SE8rJUM";
    const videoId = "gui_SE8rJUM";

    const expected = videoId;
    const result = parseYoutubeVideo(videoUrl);

    result.should.equal(expected);
  });

  it("can parse the video id from an embedded video url", () => {
    const videoUrl = "https://www.youtube.com/embed/gui_SE8rJUM?version";
    const videoId = "gui_SE8rJUM";

    const expected = videoId;
    const result = parseYoutubeVideo(videoUrl);

    result.should.equal(expected);
  });

  it("can parse the channel id from a channel id", () => {
    const channelId = "UC_QIfHvN9auy2CoOdSfMWDw";

    const expected = channelId;
    const result = parseYoutubeChannel(channelId);

    result.should.equal(expected);
  });

  it("can parse the channel id from a channel url", () => {
    const channelUrl =
      "https://www.youtube.com/channel/UC_QIfHvN9auy2CoOdSfMWDw";
    const channelId = "UC_QIfHvN9auy2CoOdSfMWDw";

    const expected = channelId;
    const result = parseYoutubeChannel(channelUrl);

    result.should.equal(expected);
  });

  ["featured", "videos", "playlists", "community", "channels", "about"].forEach(
    (segment) =>
      it(`can parse the channel id from a channel url with a special segment: ${segment}`, () => {
        const channelUrl = `https://www.youtube.com/channel/UC_QIfHvN9auy2CoOdSfMWDw/${segment}`;
        const channelId = "UC_QIfHvN9auy2CoOdSfMWDw";

        const expected = channelId;
        const result = parseYoutubeChannel(channelUrl);

        result.should.equal(expected);
      }),
  );
});

describe("parse youtube video urls", () => {
  it("can parse video urls", () => {
    const result = every(isYoutubeVideo, videoUrls);

    result.should.equal(true);
  });

  it("fails similar video urls", () => {
    const result = every(isYoutubeVideo, notVideoUrls);

    result.should.equal(false);
  });

  it("fails channel urls", () => {
    const result = every(isYoutubeVideo, channelUrls);

    result.should.equal(false);
  });

  it("can normalize youtube video urls", () => {
    const urls = [
      "https://www.youtube.com/watch?v=tcCBtSjKEzI",
      "http://youtu.be/tcCBtSjKEzI",
      "tcCBtSjKEzI",
    ];
    const expected = "https://www.youtube.com/watch?v=tcCBtSjKEzI";

    const result = every((u) => normalizeYoutubeVideoUrl(u) === expected, urls);

    result.should.equal(true);
  });
});

describe("parse youtube channel urls", () => {
  it("can parse channel urls", () => {
    const result = every(isYoutubeChannel, channelUrls);

    result.should.equal(true);
  });

  it("fails to parse video urls", () => {
    const result = every(isYoutubeChannel, videoUrls.concat(notVideoUrls));

    result.should.equal(false);
  });

  it("can normalize youtube channel urls", () => {
    const urls = [
      "https://www.youtube.com/channel/UCegnDJbvrOhvbLU3IzeIV8A",
      "UCegnDJbvrOhvbLU3IzeIV8A",
    ];

    const expected = "https://www.youtube.com/channel/UCegnDJbvrOhvbLU3IzeIV8A";

    const result = every(
      (u) => normalizeYoutubeChannelUrl(u) === expected,
      urls,
    );

    result.should.equal(true);
  });
});
